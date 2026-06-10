import Section from './Section';
import { CHAPTERS } from '../chapters';

const WA = 'https://wa.me/393334567890';

export default function Overlay() {
  const C = CHAPTERS;
  return (
    <div id="overlay">

      {/* ════ 01 · HERO ════ */}
      <Section a={C.hero.a} b={C.hero.b} id="ch-hero" className="ch-hero">
        <div className="hero-stack">
          <span className="eyebrow" data-r>Milano · Arte da Indossare</span>
          <h1 className="hero-h1">
            <span data-r>L&rsquo;Arte</span>
            <em data-r>delle Unghie</em>
          </h1>
          <div className="hero-ident" data-r>
            <span className="hero-name">Sabrina Cortez</span>
            <span className="hero-role">Master Nail Designer</span>
          </div>
        </div>
        <div className="scroll-cue" data-r>
          <span>Scorri per entrare</span>
          <i />
        </div>
      </Section>

      {/* ════ 02 · MANIFESTO ════ */}
      <Section a={C.manifesto.a} b={C.manifesto.b} id="ch-manifesto" className="ch-manifesto">
        <div className="manifesto">
          <p data-r>L&rsquo;arte non si</p>
          <p data-r><em>appende —</em></p>
          <p data-r>si <em>porta</em></p>
          <p data-r><em>sulle dita.</em></p>
          <div className="m-attr" data-r>
            <i />
            <span>Sabrina Cortez · Milano</span>
          </div>
        </div>
      </Section>

      {/* ════ 03 · CHI È SABRINA ════ */}
      <Section a={C.about.a} b={C.about.b} id="ch-about" className="ch-about">
        <div className="copy-col copy-right">
          <span className="eyebrow" data-r>L&rsquo;Artista</span>
          <h2 data-r>Dove la <em>Precisione</em><br />incontra l&rsquo;Arte</h2>
          <p data-r>Nata a San Paolo e cresciuta tra arte e colore, Sabrina Cortez ha trovato a Milano la sua tela perfetta. Ogni unghia è un&rsquo;opera unica — tecnica giapponese, materiali d&rsquo;alta gamma, visione estetica assoluta.</p>
          <p data-r>Con 7 anni di esperienza nel cuore del Fashion District milanese, serve una clientela esclusiva che esige il meglio. Senza compromessi.</p>
          <div className="stats" data-r>
            <div><b data-count="7">0</b><span>Anni</span></div>
            <div><b data-count="1200">0</b><span>Opere</span></div>
            <div><b data-count="50">0</b><span>Tecniche</span></div>
          </div>
          <div className="sig" data-r>
            <span className="sig-name">Sabrina Cortez</span>
            <span className="sig-title">Master Nail Designer</span>
          </div>
        </div>
      </Section>

      {/* ════ 04 · ATELIER VIP ════ */}
      <Section a={C.vip.a} b={C.vip.b} id="ch-vip" className="ch-vip">
        <div className="vip-frame">
          <span className="eyebrow" data-r>Commissione Privata</span>
          <h2 data-r>Atelier VIP <em>a Domicilio</em></h2>
          <p className="lead" data-r>L&rsquo;esperienza di lusso che viene da te. Hotel, ville, penthouse — ovunque.</p>
          <div className="vip-rows">
            <div className="vip-row" data-r>
              <span className="n">01</span>
              <div><b>Setup Completo</b><span>Equipaggiamento professionale portato fino a te, senza compromessi.</span></div>
            </div>
            <div className="vip-row vip-row--featured" data-r>
              <span className="n">02</span>
              <div><b>Privacy &amp; Lusso</b><span>Hotel 5 stelle, ville private, penthouse esclusive. Il lusso non aspetta.</span></div>
            </div>
            <div className="vip-row" data-r>
              <span className="n">03</span>
              <div><b>Rituale Sensoriale</b><span>Aromaterapia, musica e benessere inclusi in ogni sessione.</span></div>
            </div>
          </div>
          <a href={`${WA}?text=Vorrei%20prenotare%20il%20servizio%20Atelier%20VIP%20a%20domicilio`}
             className="cta-line" target="_blank" rel="noopener" data-r>
            Prenota il Tuo Atelier
          </a>
        </div>
      </Section>

      {/* ════ 05 · FLASHUNGHIE ════ */}
      <Section a={C.flash.a} b={C.flash.b} id="ch-flash" className="ch-flash">
        <div className="copy-col copy-left">
          <span className="eyebrow" data-r>Studio Milano Centro</span>
          <h2 data-r>Flash<em>Unghie</em></h2>
          <p data-r>Nel cuore del Fashion District, lo studio accoglie chi cerca l&rsquo;eccellenza di ogni giorno.</p>
          <div className="rituals" data-r>
            <p>Gel, ricostruzione, nail art su misura — ogni rituale eseguito con la calma e la precisione di un atelier. Nessuna fretta. Nessun compromesso. Solo la mano di Sabrina e il tempo che l&rsquo;opera richiede.</p>
          </div>
          <div className="flash-meta" data-r>
            <span className="fm-address">Via Montenapoleone 8, 20121 Milano</span>
            <span>Lun–Sab · 09:00–19:00 &nbsp;·&nbsp; Dom su prenotazione</span>
          </div>
          <a href={`${WA}?text=Vorrei%20prenotare%20al%20FlashUnghie%20Milano%20Centro`}
             className="cta-line" target="_blank" rel="noopener" data-r>
            Prenota allo Studio
          </a>
        </div>
      </Section>

      {/* ════ 06 · PORTFOLIO ════ */}
      <Section a={C.gallery.a} b={C.gallery.b} id="ch-gallery" className="ch-gallery">
        <div className="gallery-head">
          <span className="eyebrow" data-r>La Collezione</span>
          <h2 data-r>Ogni Unghia, <em>un&rsquo;Opera</em></h2>
        </div>
        <div className="gallery-hint" data-r>
          <span>Opere sospese nello spazio — muovi il mouse per esplorare</span>
        </div>
      </Section>

      {/* ════ 07 · LA TRASFORMAZIONE ════ */}
      <Section a={C.transform.a} b={C.transform.b} id="ch-transform" className="ch-transform">
        <div className="t-labels">
          <span className="t-label" data-r>Prima</span>
          <div className="t-divider" data-r>
            <i />
            <span>La <em>Trasformazione</em></span>
            <i />
          </div>
          <span className="t-label" data-r>Dopo</span>
        </div>
      </Section>

      {/* ════ 08 · CONTATTI — two doors, nothing else ════ */}
      <Section a={C.contact.a} b={C.contact.b} id="ch-contact" className="ch-contact">
        <div className="contact-stack">
          <span className="eyebrow" data-r>Commissiona la Tua Opera</span>
          <h2 data-r>Prenota il Tuo <em>Momento</em></h2>
          <div className="contact-doors">
            <a href={`${WA}?text=Vorrei%20contattare%20Sabrina%20per%20l%27Atelier%20VIP`}
               className="door" target="_blank" rel="noopener" data-r>
              <span className="door-title">Contatta Sabrina</span>
              <span className="door-sub">Atelier VIP · Concierge Privato</span>
            </a>
            <a href={`${WA}?text=Vorrei%20prenotare%20al%20FlashUnghie%20Milano%20Centro`}
               className="door" target="_blank" rel="noopener" data-r>
              <span className="door-title">FlashUnghie</span>
              <span className="door-sub">Lo Studio · Via Montenapoleone 8, 20121 Milano</span>
            </a>
          </div>
          <div className="contact-copy" data-r>
            <p>Sabrina Cortez · CatClaw · Milano · MMXXVI</p>
          </div>
        </div>
      </Section>

    </div>
  );
}
