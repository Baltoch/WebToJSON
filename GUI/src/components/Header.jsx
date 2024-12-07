function Header() {

    const header = {
        width: '100%',
        height: 'auto',
        padding: '8px',
        position: 'fixed',
        top: '0px',
        left: '0px',
        borderBottom: 'solid 1px #747070',
        backgroundColor: '#ffffff'
    }

    return (
        <header style={header}>
            <h1 style={{margin:'0px'}}>WebToJSON</h1>
        </header>
    );
}

export default Header