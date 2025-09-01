import React from "react";

function MainContent({ currentPage }) {
    return (
        <div className="homePage__mainContent">
            {currentPage === "home" && <h1>Welcome to the Home Page</h1>}
            {currentPage === "menu" && <h1>Menu Page</h1>}
            {currentPage === "branch" && <h1>Branch Page</h1>}
            {currentPage === "promotion" && <h1>Promotion Page</h1>}
        </div>
    );
}

export default MainContent;
