import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';

const NavTabs = () => {
    const { id } = useParams();
    const location = useLocation();

    const tabs = [
        { name: "Sorteo", path: `/edicionSorteos/${id}` },
        { name: "Pagos", path: `/edicionSorteos/${id}/pagos` },
        { name: "Boletos apartados", path: `/edicionSorteos/${id}/boletos` },
    ];

    return (
        <div className="d-flex justify-content-center mb-4">
            <div className="nav-container-custom">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.name}
                        to={tab.path}
                        end={tab.name === "Sorteo"} 
                        className={({ isActive }) =>
                            isActive ? "nav-tab active-custom" : "nav-tab"
                        }
                    >
                        {tab.name}
                    </NavLink>
                ))}
            </div>

            <style jsx="true">{`
                .nav-container-custom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #e6c8ff;
                    border: 1px solid #000;
                    border-radius: 30px;
                    padding: 4px 6px;
                    width: 100%;
                    max-width: 450px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .nav-tab {
                    color: #333;
                    text-decoration: none;
                    padding: 8px 18px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.2s ease-in-out;
                    cursor: pointer;
                    text-align: center;
                    flex-grow: 1;
                }

                .nav-tab.active-custom {
                    background-color: #9c27b0;
                    color: #fff;
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};


export default NavTabs;