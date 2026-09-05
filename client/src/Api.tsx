interface ApiCallArgs {
  uri: string;
  method: string;
  token: string;
  data: object | null;
  logout: () => void;
  error: () => void;
}

export default async function apiCall({ uri, method, token, data, logout }: ApiCallArgs) {

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
  } else if (response.status == 401 || response.status == 403) {
    logout();
    return;
  }

  const resData = await response.json();

  if (resData.status == 'failure') throw new Error(`api call failed: ${resData.message}`);
      
  return resData;
}
