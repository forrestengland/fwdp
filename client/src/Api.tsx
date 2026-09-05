interface ApiCallArgs {
  uri: string;
  method: string;
  token: string;
  data: object | null;
  logout: () => void;
  login: (token: string) => void;
}

export async function refreshToken(login, logout) {

    // access token has expired. need to request a new one using the refreshToken and retry
    console.log("access token expired. refreshing...");

    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshResponse.status == 404) {
      throw new Error("api route doesn't exist");
      return;
    } else if (refreshResponse.status == 401) { // refresh token invalid or revoked
      logout();
      return;
    }

    const refResData = await refreshResponse.json();
    console.log('refresh response:', refResData);

    login(refResData.token);

    return refResData.token;
  }


export async function apiCall({ uri, method, token, data, logout, login }: ApiCallArgs) {

  const headers = {};
  let body = null;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (method == 'POST' || method == 'PATCH') {
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }
    
  const response = await fetch(uri,{
    method: method,
    headers: headers,
    body: body,
    credentials: 'include'
  });

  if (response.status == 404) {
    throw new Error('api route does not exist');
    return;
  } else if (response.status == 401) {

    const newToken = await refreshToken(login, logout);
	  
    headers['Authorization'] = `Bearer ${newToken}`;

    // now we can retry our api call
    const response = await fetch(uri,{
      method: method,
      headers: headers,
      body: body,
      credentials: 'include'
    });

    if (response.status == 404) {
      throw new Error('api route does not exist');
      return;
    } else if (response.status == 401 || response.status == 403) { // refresh token invalid or revoked
      logout();
      return;
    }

    const resData = await response.json();
    console.log('api retry response:', resData);
    
    // end api call
    if (resData?.status == 'failure') throw new Error(`api call failed: ${resData.message}`);
    return resData;
    
  } else if (response.status == 403) {
    // user doesn't have access to this route
    throw new Error('access denied');
  }

  const resData = await response.json();

  if (resData.status == 'failure') throw new Error(`api call failed: ${resData.message}`);
      
  return resData;
}
