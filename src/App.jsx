import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import "./styles/responsive.css";
import { publicRouters } from "./routers";
import RequireAuth from "./auth/RequireAuth";
import { AuthProvider } from "./context/AuthProvider";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createContext, useEffect, useState } from "react";


const MyContext = createContext();

function App() {
  const [isToggleSidebar, setIsToggleSidebar] = useState(false);

  const [isLogin, setIsLogin] = useState(true);

  const [isHideSidebarAndHeader, setisHideSidebarAndHeader] = useState(false);

  const [themeMode, setThemeMode] = useState(true);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [isOpenNav, setIsOpenNav] = useState(false);

  useEffect(() => {
    if (themeMode === true) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("themeMode", "light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
      localStorage.setItem("themeMode", "dark");
    }
  }, [themeMode]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openNav = () => {
    setIsOpenNav(true);
  };

  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    isLogin,
    setIsLogin,
    isHideSidebarAndHeader,
    setisHideSidebarAndHeader,
    themeMode,
    setThemeMode,
    windowWidth,
    openNav,
    isOpenNav,
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <MyContext.Provider value={values}>
          {isHideSidebarAndHeader !== true && <Header />}

          <div className="main d-flex">
            {isHideSidebarAndHeader !== true && (
              <>
                <div
                  className={`sidebarOverlay d-none ${
                    isOpenNav === true && "show"
                  }`}
                  onClick={() => setIsOpenNav(false)}
                ></div>

                <div
                  className={`sidebarWrapper ${
                    isToggleSidebar === true ? "toggle" : ""
                  } ${isOpenNav === true ? "open" : ""}`}
                >
                  <Sidebar />
                </div>
              </>
            )}

            <div
              className={`content ${
                isHideSidebarAndHeader === true && "full"
              } ${isToggleSidebar === true ? "toggle" : ""}`}
            >
              <Routes>
                {publicRouters.map((route, index) => {
                  const Page = route.component;
                  return (
                    <Route
                      key={index}
                      path={route.path}
                      element={
                        route.private ? (
                          <RequireAuth>
                            <Page />
                          </RequireAuth>
                        ) : (
                          <Page />
                        )
                      }
                    />
                  );
                })}
              </Routes>
            </div>
          </div>
        </MyContext.Provider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
export { MyContext };
