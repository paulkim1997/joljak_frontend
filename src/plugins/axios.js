import axios from 'axios';

export default axios.create({
  baseURL: process.env.NODE_ENV == 'production' ? 'https://api.sab.com/api/' : process.env.NODE_ENV == 'test' ? 'http://testapi.sab.com/api/' : 'http://localhost:8080/api/'
});
