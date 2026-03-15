import "./Sidebar.css";
function Sidebar(){
    return(
        <section className="sidebar">
   
            <button>
                <img src='src/assets/blacklogo.png' className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            <ul className="history">
                <li>history 1</li>
                <li>history 2</li>
                <li>history 3</li>
            </ul>

            <div className="sign">
                <p>By Afshan &hearts;</p>
                </div>
        </section>
    )
}

export default Sidebar;