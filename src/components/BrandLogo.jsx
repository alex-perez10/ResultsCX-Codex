import { useState } from 'react'

const logoUrl = 'https://cdn.brandfetch.io/idSRDy6iew/theme/light/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1781762836358'

export default function BrandLogo() {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return <div className="brand-logo" aria-label="ResultsCX">
    {!loaded && <span className="brand-fallback">Results<span>CX</span></span>}
    {!failed && <img src={logoUrl} alt="" style={{ display: loaded ? 'block' : 'none' }} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
  </div>
}
