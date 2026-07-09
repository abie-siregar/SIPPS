import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  TableIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type SubItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  roles?: string[];
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
  roles?: string[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Data Sekolah", path: "/", pro: false }],
    roles: [
      "Admin",
      "BK",
      "Guru",
      "Wali Kelas",
      "Tenaga Kependidikan",
      "Siswa",
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
    roles: [
      "Admin",
      "BK",
      "Guru",
      "Wali Kelas",
      "Siswa",
      "Tenaga Kependidikan",
    ],
  },
  {
    name: "Manajemen Data",
    icon: <TableIcon />,
    roles: [
      "Admin",
      "BK",
      "Guru",
      "Wali Kelas",
      "Tenaga Kependidikan",
      "Siswa",
    ],
    subItems: [
      {
        name: "Data Poin Pelanggaran",
        path: "/data-poin-pelanggaran",
        pro: false,
        roles: [
          "Admin",
          "BK",
          "Guru",
          "Wali Kelas",
          "Tenaga Kependidikan",
          "Siswa",
        ],
      },
      {
        name: "Data Pendidik dan Tenaga Kependidikan",
        path: "/PTK",
        pro: false,
        roles: ["Admin"],
      },
      {
        name: "Data Rombongan Belajar",
        path: "/data-rombel",
        pro: false,
        roles: ["Admin", "Wali Kelas"],
      },
      {
        name: "Data Siswa",
        path: "/siswa",
        pro: false,
        roles: ["Admin", "BK", "Wali Kelas"],
      },
      {
        name: "Data User",
        path: "/data-user",
        pro: false,
        roles: ["Admin"],
      },
      {
        name: "Data Sanksi",
        path: "/data-sanksi",
        pro: false,
        roles: [
          "Admin",
          "BK",
          "Guru",
          "Wali Kelas",
          "Tenaga Kependidikan",
          "Siswa",
        ],
      },
      {
        name: "Plotting BK",
        path: "/plotting-bk",
        pro: false,
        roles: ["Admin"],
      },
      {
        name: "Plotting BK",
        path: "/plotting-bk",
        pro: false,
        roles: ["Admin"],
      },
    ],
  },
  {
    name: "Pelanggaran Siswa",
    icon: <TableIcon />,
    roles: ["Admin", "BK", "Wali Kelas", "Siswa"],
    subItems: [
      {
        name: "Data Pelanggaran Siswa",
        path: "/data-pelanggaran-siswa",
        pro: false,
        roles: ["Admin", "BK", "Wali Kelas", "Siswa"],
      },
    ],
  },
  {
    name: "Test Layout",
    icon: <TableIcon />,
    roles: ["Admin", "BK", "Wali Kelas", "Siswa"],
    subItems: [
      {
        name: "Manajemen Data Poin dan Sanksi",
        path: "/PoinSanksi",
        pro: false,
        roles: ["Admin", "BK", "Wali Kelas", "Siswa"],
      },
      {
        name: "Manajemen Data User",
        path: "/ManajemenDataUser",
        pro: false,
        roles: ["Admin"],
      },
      {
        name: "Manajemen Rombel dan Plotting BK",
        path: "/ManajemenRombelPlotting",
        pro: false,
        roles: ["Admin"],
      },
      {
        name: "Manajemen Data Siswa",
        path: "/ManajemenDataSiswa",
        pro: false,
        roles: ["Admin", "BK", "Wali Kelas"],
      },
      {
        name: "Manajemen Pelanggaran dan Pembinaan",
        path: "/ManajemenPelanggaranPembinaan",
        pro: false,
        roles: ["Admin", "BK", "Wali Kelas", "Siswa"],
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = navItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items
        .filter((nav) => !nav.roles || nav.roles.includes(user?.role ?? ""))
        .map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size  ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <div
                    ref={(el) => {
                      subMenuRefs.current[`${menuType}-${index}`] = el;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height:
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? `${subMenuHeight[`${menuType}-${index}`]}px`
                          : "0px",
                    }}
                  >
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems
                        .filter(
                          (sub) =>
                            !sub.roles || sub.roles.includes(user?.role ?? ""),
                        )
                        .map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.path}
                              className={`menu-dropdown-item ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-item-active"
                                  : "menu-dropdown-item-inactive"
                              }`}
                            >
                              {subItem.name}
                              <span className="flex items-center gap-1 ml-auto">
                                {subItem.new && (
                                  <span
                                    className={`ml-auto ${
                                      isActive(subItem.path)
                                        ? "menu-dropdown-badge-active"
                                        : "menu-dropdown-badge-inactive"
                                    } menu-dropdown-badge`}
                                  >
                                    new
                                  </span>
                                )}
                                {subItem.pro && (
                                  <span
                                    className={`ml-auto ${
                                      isActive(subItem.path)
                                        ? "menu-dropdown-badge-active"
                                        : "menu-dropdown-badge-inactive"
                                    } menu-dropdown-badge`}
                                  >
                                    pro
                                  </span>
                                )}
                              </span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
          </li>
        ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(false)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="hidden lg:block">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
