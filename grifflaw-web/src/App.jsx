import React from 'react'

function App() {
    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
            <nav className="glass-nav">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                    GRIFFIN<span className="accent-blue">LAW</span>
                </div>
                <div style={{ display: 'flex', gap: '30px', fontSize: '0.9rem', color: '#888' }}>
                    <a href="#about" style={{ color: 'inherit', textDecoration: 'none' }}>ABOUT</a>
                    <a href="#practice" style={{ color: 'inherit', textDecoration: 'none' }}>PRACTICE AREAS</a>
                    <a href="#contact" style={{ color: 'inherit', textDecoration: 'none' }}>CONTACT</a>
                </div>
            </nav>

            <header style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h1>Elite Legal Advocacy <br /> for Complex Litigation</h1>
                <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '700px', margin: '20px auto' }}>
                    Griffin Law LLC provides sophisticated legal counsel across Pennsylvania and Ohio, specializing in medical malpractice and high-stakes commercial disputes.
                </p>
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <button style={{ background: '#646cff', color: 'white' }}>CONSULTATION</button>
                    <button>PRACTICE AREAS</button>
                </div>
            </header>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div className="premium-card">
                    <h3 className="accent-blue">Medical Malpractice</h3>
                    <p>Championing the rights of the injured with rigorous investigation and unparalleled expertise.</p>
                </div>
                <div className="premium-card">
                    <h3 className="accent-blue">Commercial Litigation</h3>
                    <p>Strategic representation for complex business disputes, ensuring your interests are protected at every stage.</p>
                </div>
                <div className="premium-card">
                    <h3 className="accent-blue">Personal Injury</h3>
                    <p>Dedicated to securing the compensation you deserve through aggressive advocacy and compassionate service.</p>
                </div>
            </section>

            <footer style={{ marginTop: '120px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', textAlign: 'center', color: '#666' }}>
                <p>&copy; 2026 GRIFFIN LAW LLC. ALL RIGHTS RESERVED.</p>
                <p style={{ fontSize: '0.8rem' }}>PENNSYLVANIA | OHIO</p>
            </footer>
        </div>
    )
}

export default App
