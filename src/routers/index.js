import Login from "../pages/Login";
import SignUp from "../pages/Signup";
import Products from "../pages/Products";
import Dashboard from "../pages/Dashboard";
import ProductUpload from "../pages/ProductUpload";
import EntryManager from "../pages/EntryManager";

const publicRouters = [

        { path: '/admin/login', component: Login },
        { path: '/admin/signUp', component: SignUp },

        { path: '/admin', component: Dashboard, private: true },
        { path: '/admin/dashboard', component: Dashboard},
        { path: '/admin/products', component: Products},
        { path: '/admin/product-upload', component: ProductUpload},
        { path: '/admin/entry-form', component: EntryManager},
       
      ];

export { publicRouters};
