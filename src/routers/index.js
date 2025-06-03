import Login from "../pages/admin/Login";
import SignUp from "../pages/admin/Signup";
import Products from "../pages/admin/product/Products";
import ProductUpload from "../pages/admin/product/ProductUpload";
import ProductUpdate from "../pages/admin/product/ProductUpdate";
import Supplier from "../pages/admin/Supplier";
import User from "../pages/admin/User";
import ImportSlips from "../pages/admin/importslips/ImportSlips";

import Dashboard from "../pages/admin/dashboard/Dashboard";

import Sell from "../pages/admin/sell/Sell";

import NoAccess from "../pages/admin/NoAccess";

const publicRouters = [

        { path: '/admin/login', component: Login },
        { path: '/admin/signUp', component: SignUp },

        { path: '/admin', component: Dashboard, private: true },
        { path: '/admin/dashboard', component: Dashboard, private: true},
        { path: '/admin/products', component: Products, private: true},
        { path: '/admin/product-upload', component: ProductUpload, private: true},
        { path: '/admin/product-update/:id', component: ProductUpdate , private: true},
        { path: '/admin/supplier', component: Supplier, private: true},
        { path: '/admin/users', component: User, private: true},
        { path: '/admin/importslips', component: ImportSlips, private: true},
        { path: '/admin/403', component: NoAccess},

        { path: '/admin/sell', component: Sell},
       
      ];

export { publicRouters};
