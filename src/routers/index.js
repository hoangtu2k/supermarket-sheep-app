import Login from "../pages/Login";
import SignUp from "../pages/Signup";
import Products from "../pages/Products";
import Dashboard from "../pages/Dashboard";

const publicRouters = [

        { path: '/admin/login', component: Login },
        { path: '/admin/signUp', component: SignUp },

        { path: '/admin', component: Dashboard, private: true },
        { path: '/admin/dashboard', component: Dashboard, private: true },
        { path: '/admin/products', component: Products, private: true},
       
      ];

export { publicRouters};
