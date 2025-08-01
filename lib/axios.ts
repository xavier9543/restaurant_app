// lib/axios.ts
import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // asegúrate de que termine en /
  headers: {
    'Content-Type': 'application/json',
  },
})

export default API
