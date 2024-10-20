import axios from 'axios'
// import Axios from '../helpers/axios'
import APIConfig from './api.config'

export const getTest = () => axios.get(`${APIConfig.url}/device/list/G`)
