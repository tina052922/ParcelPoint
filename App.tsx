import { useEffect, useState } from 'react';

type Screen =
  | 'welcome' | 'login' | 'register' | 'home' | 'pickup' | 'confirm'
  | 'door' | 'done' | 'return' | 'reason' | 'locker' | 'returned'
  | 'guest' | 'help' | 'profile' | 'error';

const icons: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  box: 'm4 7 8-4 8 4-8 4z M4 7v10l8 4 8-4V7 M12 11v10',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3 M16 4h3a1 1 0 0 1 1 1v3 M20 16v3a1 1 0 0 1-1 1h-3 M8 20H5a1 1 0 0 1-1-1v-3 M8 12h8',
  return: 'M4 9V5h4 M4 5l5 5 M5.5 15a7 7 0 1 0 1-8',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M9.8 9a2.4 2.4 0 1 1 3.7 2c-1.5.8-1.5 1.5-1.5 2.5 M12 17h.01',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  back: 'M19 12H5 M11 18l-6-6 6-6',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  user: 'M20 21a8 8 0 0 0-16 0 M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10',
  check: 'm5 12 4 4L19 6',
};

function Icon({ name, size = 34 }: { name: string; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={icons[name]} />
  </svg>;
}

function Button({ children, onClick, variant = 'primary', disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'dark' | 'ghost' | 'outline'; disabled?: boolean }) {
  return <button className={`button ${variant}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Spec({ children }: { children: string }) {
  return <span className="spec">{children}</span>;
}

function Header({ title, onBack, onProfile }: { title: string; onBack?: () => void; onProfile?: () => void }) {
  return <header className="header">
    <div className="header-row">
      {onBack ? <button className="circle ghost-circle" onClick={onBack} aria-label="Back"><Icon name="back" /></button> : <button className="avatar" onClick={onProfile} aria-label="Profile">B</button>}
      <div className="brand"><span className="brand-mark"><Icon name="box" size={28} /></span> ParcelPoint</div>
      <button className="circle ghost-circle" aria-label="Notifications"><Icon name="bell" /></button>
    </div>
    <h1>{title}</h1>
  </header>;
}

function Illustration() {
  return <div className="art" aria-label="ParcelPoint delivery illustration">
    <div className="sun" />
    <div className="van"><span className="window" /><span className="van-logo"><Icon name="box" size={25} /></span><i /><i /></div>
    <div className="person"><span className="head" /><span className="body" /><span className="leg one" /><span className="leg two" /></div>
    <div className="parcel"><span className="tape" /><Icon name="box" size={52} /></div>
  </div>;
}

function Keypad({ value, setValue, max = 4 }: { value: string; setValue: (v: string) => void; max?: number }) {
  return <div className="keypad">
    {[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map((key) =>
      <button key={key} onClick={() => key === '⌫' ? setValue(value.slice(0,-1)) : key === '✓' ? null : value.length < max && setValue(value + key)}>{key}</button>
    )}
  </div>;
}

function Stepper({ current }: { current: number }) {
  return <div className="stepper">{[1,2,3,4].map(n => <span key={n} className={n <= current ? 'active' : ''}><i>{n < current ? '✓' : n}</i>{n < 4 && <b />}</span>)}</div>;
}

function BottomNav({ go }: { go: (s: Screen) => void }) {
  return <nav className="bottom-nav">
    <button onClick={() => go('home')}><Icon name="home" /><span>Home</span></button>
    <button onClick={() => go('pickup')}><Icon name="box" /><span>Pick up</span></button>
    <button className="scan-nav" onClick={() => go('pickup')}><i><Icon name="scan" /></i><span>Scan</span></button>
    <button onClick={() => go('return')}><Icon name="return" /><span>Return</span></button>
    <button onClick={() => go('help')}><Icon name="help" /><span>Help</span></button>
  </nav>;
}

function FlowShell({ title, spec, step, children, back, cancel, primary, primaryLabel = 'Continue', disabled = false }: {
  title: string; spec: string; step: number; children: React.ReactNode; back: () => void; cancel: () => void; primary: () => void; primaryLabel?: string; disabled?: boolean;
}) {
  return <main className="screen">
    <Header title={title} onBack={back} />
    <section className="flow">
      <Spec>{spec}</Spec><Stepper current={step} />
      {children}
      <div className="flow-actions"><button onClick={back}>Back</button><button onClick={cancel}>Cancel</button></div>
      <Button onClick={primary} disabled={disabled}>{primaryLabel}<Icon name="arrow" /></Button>
    </section>
  </main>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [idle, setIdle] = useState(false);
  const go = (s: Screen) => { setScreen(s); setPin(''); setCode(''); setError(''); setIdle(false); };

  useEffect(() => {
    if (screen !== 'door') return;
    const t = setTimeout(() => go('done'), 2000);
    return () => clearTimeout(t);
  }, [screen]);

  useEffect(() => {
    const reset = () => { clearTimeout(timer); timer = window.setTimeout(() => setIdle(true), 60000); };
    let timer = window.setTimeout(() => setIdle(true), 60000);
    window.addEventListener('pointerdown', reset);
    return () => { clearTimeout(timer); window.removeEventListener('pointerdown', reset); };
  }, [screen]);

  const welcome = screen === 'welcome';
  return <div className="viewport">
    <div className={`kiosk ${welcome ? 'welcome' : ''}`}>
      {welcome && <main className="screen welcome-screen">
        <div className="welcome-top">
          <div className="brand large"><span className="brand-mark"><Icon name="box" /></span> ParcelPoint</div>
          <div className="locale"><button className="selected">EN</button><button>FIL</button></div>
        </div>
        <Illustration />
        <section className="welcome-copy">
          <Spec>PP-01 · WELCOME</Spec>
          <h1>Send less waiting.<br/><em>More moving.</em></h1>
          <p>Pick up or return your parcel in just a few taps.</p>
        </section>
        <div className="welcome-actions">
          <Button onClick={() => go('login')}>Log in <Icon name="arrow" /></Button>
          <Button variant="dark" onClick={() => go('register')}>Create an account</Button>
          <Button variant="outline" onClick={() => go('guest')}>Guest pickup</Button>
          <button className="help-link" onClick={() => go('help')}><Icon name="help" size={28} /> Need help?</button>
        </div>
      </main>}

      {screen === 'login' && <main className="screen">
        <Header title="Welcome back" onBack={() => go('welcome')} />
        <section className="content login-content">
          <Spec>PP-02 · LOG IN</Spec>
          <h2>Log in to your account</h2>
          <label>Mobile number or email<input placeholder="+63 917 000 0000" defaultValue="brandon@email.com" /></label>
          <div className="pin-label"><span>Enter your 4-digit PIN</span><span className={error ? 'error-text' : ''}>{error || 'Secure entry'}</span></div>
          <div className="pin-dots">{[0,1,2,3].map(n => <i key={n} className={pin.length > n ? 'filled' : ''} />)}</div>
          <Keypad value={pin} setValue={setPin} />
          <Button disabled={pin.length < 4} onClick={() => pin === '0000' ? setError('Incorrect PIN. 2 attempts left.') : go('home')}>Log in <Icon name="arrow" /></Button>
          <button className="text-button">Forgot PIN?</button>
        </section>
      </main>}

      {screen === 'register' && <FlowShell title="Create account" spec="PP-03 · REGISTER" step={pin ? 3 : 1} back={() => go('welcome')} cancel={() => go('welcome')} primary={() => pin.length === 4 ? go('home') : setPin('1234')} primaryLabel={pin ? 'Create account' : 'Continue'}>
        <h2>{pin ? 'Review & consent' : 'Your details'}</h2>
        {!pin ? <div className="stack"><label>Full name<input defaultValue="Brandon Reyes" /></label><label>Mobile number<input defaultValue="+63 917 420 6812" /></label><label>Email<input defaultValue="brandon@email.com" /></label></div> :
          <div className="success-panel"><span className="success-icon"><Icon name="check" /></span><h3>Your 4-digit PIN is ready</h3><p>By continuing, you agree to ParcelPoint’s terms and privacy policy.</p><label className="check-row"><input type="checkbox" defaultChecked /> Send me parcel status updates</label></div>}
      </FlowShell>}

      {screen === 'home' && <main className="screen home-screen">
        <header className="dashboard-header">
          <div className="header-row">
            <button className="avatar portrait" onClick={() => go('profile')} aria-label="Profile">BR</button>
            <div className="brand"><span className="brand-mark"><Icon name="box" size={28} /></span> ParcelPoint</div>
            <button className="circle ghost-circle notification" aria-label="Notifications"><Icon name="bell" /><i /></button>
          </div>
          <h1>Hello,<br/><strong>Brandon!</strong></h1>
          <button className="scan-pill dark-search" onClick={() => go('pickup')}><span><Icon name="scan" /> Scan or enter tracking number</span><i><Icon name="arrow" /></i></button>
          <div className="dashboard-actions">
            <button onClick={() => go('pickup')}><span><Icon name="box" /></span><b>Pick up parcel</b><Icon name="arrow" /></button>
            <button onClick={() => go('return')}><span><Icon name="return" /></span><b>Return parcel</b><Icon name="arrow" /></button>
          </div>
        </header>
        <section className="content home-content">
          <Spec>PP-04 · HOME</Spec>
          <div className="section-title"><h2>Active parcels</h2><button>View all</button></div>
          <article className="parcel-card">
            <div className="parcel-thumb"><Icon name="box" size={54} /></div>
            <div><small>PP-8392-1048</small><h3>Nike Air Max 90</h3><span className="chip success">Ready for pickup</span></div>
            <button onClick={() => go('confirm')}><Icon name="arrow" /></button>
            <div className="timeline"><i className="done" /><b/><i className="done" /><b/><i className="current" /><b/><i /></div>
          </article>
          <article className="parcel-card secondary-parcel">
            <div className="parcel-thumb muted"><Icon name="box" size={54} /></div>
            <div><small>PP-6083-4271</small><h3>Home essentials</h3><span className="chip transit">In transit</span></div>
            <button onClick={() => go('confirm')}><Icon name="arrow" /></button>
            <div className="timeline"><i className="done" /><b/><i className="current" /><b/><i /><b/><i /></div>
          </article>
        </section>
        <BottomNav go={go} />
      </main>}

      {screen === 'pickup' && <FlowShell title="Pick up parcel" spec="PP-05A · PICK UP" step={1} back={() => go('home')} cancel={() => go('home')} primary={() => code === '111111' ? (setError('Code not found. Check and try again.'), setScreen('error')) : go('confirm')} disabled={code.length < 6}>
        <h2>Enter your pickup code</h2><p className="lead">You’ll find the 6-digit code in your SMS or email.</p>
        <label>Pickup code<input className="code-input" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g,''))} placeholder="000 000" /></label>
        <div className="or"><span>or</span></div>
        <button className="scan-card" onClick={() => {setCode('839210');}}><span><Icon name="scan" size={44} /></span><div><b>Scan QR code</b><small>Hold your code in front of the scanner</small></div><Icon name="arrow" /></button>
      </FlowShell>}

      {screen === 'confirm' && <FlowShell title="Confirm pickup" spec="PP-05B · CONFIRM" step={2} back={() => go('pickup')} cancel={() => go('home')} primary={() => go('door')} primaryLabel="Open locker 28">
        <h2>Your parcel is ready</h2>
        <div className="locker-card"><div className="box-art"><Icon name="box" size={74} /></div><div><span className="chip success">Ready for pickup</span><h3>Nike Air Max 90</h3><p>Parcel ID · PP-8392-1048</p></div></div>
        <div className="locker-location"><span>28</span><div><small>Locker assigned</small><h3>Locker 28 · Row B</h3><p>Large compartment</p></div></div>
      </FlowShell>}

      {screen === 'door' && <main className="screen center-screen"><Header title="Locker 28 is open" /><section className="center-content"><Spec>PP-05C · DOOR OPEN</Spec><div className="door-art"><span>28</span><i /></div><h2>Take your parcel</h2><p>Close the locker door when you’re done.<br/>This screen will continue automatically.</p><div className="loading"><i /></div></section></main>}

      {screen === 'done' && <main className="screen center-screen"><Header title="Pickup complete" /><section className="center-content done-content"><Spec>PP-05D · COLLECTED</Spec><div className="big-check"><Icon name="check" size={82} /></div><h2>Parcel collected!</h2><p>Your parcel was collected at 10:42 AM.</p><div className="receipt"><h3>Send receipt</h3><div><button>SMS</button><button>Email</button><button>Print</button></div></div><Button onClick={() => go('home')}>Done</Button></section></main>}

      {screen === 'return' && <FlowShell title="Return a parcel" spec="PP-06A · RETURN" step={1} back={() => go('home')} cancel={() => go('home')} primary={() => go('reason')}>
        <h2>Scan your return label</h2><p className="lead">Place the barcode 10–15 cm in front of the scanner.</p><div className="scanner"><span><Icon name="scan" size={76} /></span><i /></div><div className="or"><span>or enter manually</span></div><label>Tracking number<input defaultValue="RET-6083-4271" /></label>
      </FlowShell>}

      {screen === 'reason' && <FlowShell title="Return a parcel" spec="PP-06B · REASON" step={2} back={() => go('return')} cancel={() => go('home')} primary={() => go('locker')}>
        <h2>Why are you returning it?</h2><div className="reason-list">{['Wrong size','Changed my mind','Item damaged','Other'].map((x,i) => <label key={x}><input type="radio" name="reason" defaultChecked={!i}/><span>{x}</span></label>)}</div>
      </FlowShell>}

      {screen === 'locker' && <FlowShell title="Locker assigned" spec="PP-06C · LOCKER" step={3} back={() => go('reason')} cancel={() => go('home')} primary={() => go('returned')} primaryLabel="I’ve closed the door">
        <div className="locker-number">14</div><h2>Place parcel in Locker 14</h2><p className="lead">Put your parcel inside, then firmly close the door.</p><div className="notice"><Icon name="help" /><span>Make sure the label is attached and visible.</span></div>
      </FlowShell>}

      {screen === 'returned' && <main className="screen center-screen"><Header title="Return received" /><section className="center-content done-content"><Spec>PP-06D · COMPLETE</Spec><div className="big-check"><Icon name="check" size={82} /></div><h2>Return received</h2><p>Tracking RET-6083-4271 is on its way back.</p><Button onClick={() => go('home')}>Back to home</Button></section></main>}

      {screen === 'guest' && <FlowShell title="Guest pickup" spec="PP-07 · GUEST" step={1} back={() => go('welcome')} cancel={() => go('welcome')} primary={() => go('confirm')} disabled={code.length < 6}>
        <h2>Find your parcel</h2><p className="lead">No account needed. Enter the details from your pickup message.</p><label>6-digit pickup code<input maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g,''))} placeholder="000 000" /></label><label>Last 4 digits of mobile<input maxLength={4} placeholder="••••" /></label><div className="secure-note"><Icon name="check" /> Your information is encrypted and never stored.</div>
      </FlowShell>}

      {screen === 'help' && <main className="screen"><Header title="How can we help?" onBack={() => go(welcome ? 'welcome' : 'home')} /><section className="content"><Spec>PP-09A · HELP</Spec><h2>Help centre</h2><div className="help-list">{['I can’t open my locker','My pickup code doesn’t work','Return a parcel','Accessibility options'].map(x => <button key={x}><span>{x}</span><Icon name="arrow" /></button>)}</div><div className="support-card"><span className="icon-tile"><Icon name="help" /></span><div><h3>Talk to support</h3><p>Average wait: under 2 minutes</p></div><Button>Call now</Button></div></section></main>}

      {screen === 'profile' && <main className="screen"><Header title="Your profile" onBack={() => go('home')} /><section className="content"><Spec>PP-09B · PROFILE</Spec><div className="profile"><div className="avatar huge">BR</div><h2>Brandon Reyes</h2><p>+63 917 420 6812</p></div><div className="help-list"><button><span>Account details</span><Icon name="arrow" /></button><button><span>Notifications</span><Icon name="arrow" /></button><button><span>Language · English</span><Icon name="arrow" /></button></div><Button variant="outline" onClick={() => go('welcome')}>Sign out</Button></section></main>}

      {screen === 'error' && <main className="screen center-screen"><Header title="Something went wrong" onBack={() => go('pickup')} /><section className="center-content error-content"><Spec>PP-08 · ERROR</Spec><div className="error-icon">!</div><h2>{error || 'We couldn’t find that code'}</h2><p>Check the code in your message and try again.<br/>You have 3 attempts remaining.</p><Button onClick={() => go('pickup')}>Try again</Button><Button variant="outline" onClick={() => go('help')}>Get help</Button><div className="error-switcher"><button>Locker full</button><button>Door fault</button><button>Offline</button></div></section></main>}
    </div>

    {idle && <div className="modal-backdrop"><div className="modal"><span className="modal-icon">60</span><Spec>PP-08F · IDLE</Spec><h2>Still there?</h2><p>For your privacy, this session will end shortly.</p><Button onClick={() => setIdle(false)}>Yes, keep going</Button><button className="text-button" onClick={() => go('welcome')}>End session</button></div></div>}
  </div>;
}
