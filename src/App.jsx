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
import ProtectedRoute from './components/protected-route';


const router=createBrowserRouter([
  {
    element:<AppLayout/>,
    children:[
      {
        path:'/',
        element:<Auth/>
      },
      {
        path:'/dashboard',
        element:<ProtectedRoute><Dashboard/></ProtectedRoute>
      },
      {
        path:'/auth',
        element:<Auth/>
      },
      {
        path:'/create',
        element:<ProtectedRoute><LandingPage/></ProtectedRoute>
      },
      {
        path:'/link/:id',
        element:<ProtectedRoute><LinkPage/></ProtectedRoute>
      },
      {
        path:'/product/:slug',
        element:<ProtectedRoute><ProductPage/></ProtectedRoute>
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
