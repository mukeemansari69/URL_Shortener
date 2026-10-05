import React from 'react'
import "./App.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './layouts/app-layout';
import RedirectLink from './pages/redirect-link';
import LinkPage from './pages/link';
import Dashboard from './pages/dashboard';
import LandingPage from './pages/landingPage';
import Auth from './pages/auth';
import ProductPage from './pages/product-page';


const router=createBrowserRouter([
  {
    element:<AppLayout/>,
    children:[
      {
        path:'/',
        element:<LandingPage/>
      },
      {
        path:'/dashboard',
        element:<Dashboard/>
      },
      {
        path:'/auth',
        element:<Auth/>
      },
      {
        path:'/link/:id',
        element:<LinkPage/>
      },
      {
        path:'/product/:slug',
        element:<ProductPage/>
      },
       {
        path:'/:id',
        element:<RedirectLink/>
      },
    ]
  }
]
  
)

const App = () => {
  return (
   <RouterProvider router={router}/>
  
   
  )
}

export default App
