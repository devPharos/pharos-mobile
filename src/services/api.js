import axios from 'axios';
// import { useRegister } from '../hooks/register';

// const { empresa } = useRegister();

const api = axios.create()

api.defaults.headers.common['X-Token'] = `7adcdcec-a653-11ed-afa1-0242ac120002`;
api.defaults.headers.common['tenantId'] = '01,0301';
api.defaults.headers.common['Content-Type'] = 'multipart/form-data'

export default api;