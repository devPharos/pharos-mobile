process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import axios from 'axios';

console.log(process.env)
const api = axios.create()

api.defaults.headers.common['X-Token'] = `7adcdcec-a653-11ed-afa1-0242ac120002`;
api.defaults.headers.common['tenantId'] = '01,0301';
api.defaults.headers.common['Content-Type'] = 'multipart/form-data'

export default api;