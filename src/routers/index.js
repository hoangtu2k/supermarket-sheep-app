import Login from "../pages/admin/Login";
import SignUp from "../pages/admin/Signup";
import Products from "../pages/admin/product/Products";
import ProductUpload from "../pages/admin/product/ProductUpload";
import ProductUpdate from "../pages/admin/product/ProductUpdate";
import Supplier from "../pages/admin/Supplier";
import User from "../pages/admin/User";

import Dashboard from "../pages/admin/dashboard/Dashboard";


import NoAccess from "../pages/admin/NoAccess";

const publicRouters = [

        { path: '/admin/login', component: Login },
        { path: '/admin/signUp', component: SignUp },

        { path: '/admin', component: Dashboard, private: true },
        { path: '/admin/dashboard', component: Dashboard},
        { path: '/admin/products', component: Products},
        { path: '/admin/product-upload', component: ProductUpload},
        { path: '/admin/product-update/:id', component: ProductUpdate },
        { path: '/admin/supplier', component: Supplier},
        { path: '/admin/users', component: User},
        { path: '/admin/403', component: NoAccess},
       
      ];

export { publicRouters};
