import Login from "../pages/Login";
import SignUp from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/product/Products";
import ProductUpload from "../pages/product/ProductUpload";
import ProductUpdate from "../pages/product/ProductUpdate";
import EntryManager from "../pages/EntryManager";

const publicRouters = [

        { path: '/admin/login', component: Login },
        { path: '/admin/signUp', component: SignUp },

        { path: '/admin', component: Dashboard, private: true },
        { path: '/admin/dashboard', component: Dashboard},
        { path: '/admin/products', component: Products},
        { path: '/admin/product-upload', component: ProductUpload},
        { path: '/admin/product-update/:id', component: ProductUpdate },
        { path: '/admin/entry-form', component: EntryManager},
       
      ];

export { publicRouters};
