
import { useEffect, useState } from "react";
import logo from "./assets/hero.png"; //La reemplazaremos con el logo de TINACLEAR
import "./App.css";                   //Porque no tengo el png ahora

type Registro = {
  id: number;
  fecha: string;
  tds: number;
  turbiedad: number;
  estado: string;
  evento: string;
  valvula: string;
};

const TDS_LIMITE = 1000;
const TURBIEDAD_LIMITE = 3;
const CLAVE = "tinaclear-historial";

function obtenerHistorial(): Registro[] {
  try {
    const datos = localStorage.getItem(CLAVE);
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [hora, setHora] = useState(new Date());
  const [tds, setTds] = useState(420);
  const [turbiedad, setTurbiedad] = useState(1.8);
  const [valvula, setValvula] = useState(false);
  const [historial, setHistorial] =
    useState<Registro[]>(obtenerHistorial);
  const [mensaje, setMensaje] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);

  const calidadCorrecta =
    tds <= TDS_LIMITE &&
    turbiedad <= TURBIEDAD_LIMITE;

  useEffect(() => {
    const timer = window.setInterval(
      () => setHora(new Date()),
      1000
    );

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      CLAVE,
      JSON.stringify(historial)
    );
  }, [historial]);

  function registrar(
    nuevoTds: number,
    nuevaTurbiedad: number,
    evento: string,
    nuevaValvula: boolean
  ) {
    const correcta =
      nuevoTds <= TDS_LIMITE &&
      nuevaTurbiedad <= TURBIEDAD_LIMITE;

    const registro: Registro = {
      id: Date.now(),
      fecha: new Date().toLocaleString("es-MX"),
      tds: nuevoTds,
      turbiedad: nuevaTurbiedad,
      estado: correcta
        ? "Dentro de límites"
        : "Alerta",
      evento,
      valvula: nuevaValvula
        ? "Abierta (simulada)"
        : "Cerrada",
    };

    setHistorial((anterior) => [
      registro,
      ...anterior,
    ]);
  }

  function simularLectura() {
    // Valores ficticios para probar la interfaz.
    const nuevoTds =
      Math.random() > 0.7
        ? 1100
        : Math.floor(250 + Math.random() * 600);

    const nuevaTurbiedad =
      Math.random() > 0.7
        ? Number((4 + Math.random() * 3).toFixed(1))
        : Number(
            (0.5 + Math.random() * 2.2).toFixed(1)
          );

    const correcta =
      nuevoTds <= TDS_LIMITE &&
      nuevaTurbiedad <= TURBIEDAD_LIMITE;

    // Si una lectura excede los límites,
    // la válvula simulada se cierra automáticamente.
    const nuevaValvula = correcta ? valvula : false;

    setTds(nuevoTds);
    setTurbiedad(nuevaTurbiedad);
    setValvula(nuevaValvula);

    // Si el agua deja de cumplir los límites,
    // se cierra la válvula y se cancela cualquier
    // confirmación de apertura que estuviera abierta.
    setMostrarConfirmacion(false);

    registrar(
      nuevoTds,
      nuevaTurbiedad,
      correcta
        ? "Nueva lectura registrada"
        : "ALERTA: lectura fuera de límites",
      nuevaValvula
    );

    setMensaje(
      correcta
        ? "Lectura de demostración registrada."
        : "Alerta registrada. Válvula simulada cerrada."
    );
  }

  function cambiarValvula(abrir: boolean) {
    if (abrir && !calidadCorrecta) {
      setMostrarConfirmacion(true);
      return;
    }

    setValvula(abrir);

    registrar(
      tds,
      turbiedad,
      abrir
        ? "Apertura manual autorizada"
        : "Cierre manual de válvula",
      abrir
    );

    setMensaje(
      abrir
        ? "Apertura simulada registrada en el historial."
        : "Cierre simulado registrado en el historial."
    );
  }

  function confirmarPasoContaminado() {
    // Comprobamos de nuevo las lecturas antes
    // de aceptar la autorización.
    const sigueFueraDeLimites =
      tds > TDS_LIMITE ||
      turbiedad > TURBIEDAD_LIMITE;

    if (!sigueFueraDeLimites) {
      setMostrarConfirmacion(false);
      setMensaje(
        "Las lecturas cambiaron. Revisa el estado del agua."
      );
      return;
    }

    setValvula(true);
    setMostrarConfirmacion(false);

    registrar(
      tds,
      turbiedad,
      "ADVERTENCIA: usuario autorizó paso de agua fuera de límites",
      true
    );

    setMensaje(
      "Se autorizó el paso de agua fuera de los límites. Decisión registrada."
    );
  }

  function cancelarConfirmacion() {
    setMostrarConfirmacion(false);
    setMensaje(
      "Se canceló la apertura. La válvula permanece cerrada."
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <img src={logo} alt="Tinaclear" />
          </div>

          <div>
            <h1>Tinaclear</h1>
            <p>MONITOREO INTELIGENTE DEL AGUA</p>
          </div>
        </div>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">PANEL DE CONTROL</p>
          <h2>Calidad del agua</h2>
          <p className="muted">
            Monitoreo, alertas y registro de eventos.
          </p>
        </div>

        <div className="clock">
          <strong>
            {hora.toLocaleTimeString("es-MX")}
          </strong>

          <span>
            {hora.toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </section>

      <section
        className={`quality-banner ${
          calidadCorrecta ? "safe" : "unsafe"
        }`}
      >
        <div className="banner-icon">
          {calidadCorrecta ? "✓" : "!"}
        </div>

        <div>
          <h3>
            {calidadCorrecta
              ? "Lecturas dentro de los límites"
              : "Alerta de calidad del agua"}
          </h3>

          <p>
            {calidadCorrecta
              ? "Los parámetros monitorizados están dentro de los valores configurados."
              : "Se superó al menos uno de los límites. La válvula simulada permanece cerrada automáticamente."}
          </p>
        </div>

        <span className="banner-status">
          {calidadCorrecta ? "NORMAL" : "ALERTA"}
        </span>
      </section>

      <section className="metrics">
        <article className="card">
          <p className="card-label">
            SÓLIDOS DISUELTOS (TDS)
          </p>

          <div className="metric-number">
            {tds.toLocaleString("es-MX")}
            <span>ppm</span>
          </div>

          <div className="meter">
            <span
              className={
                tds > TDS_LIMITE ? "bar-danger" : ""
              }
              style={{
                width: `${Math.min(
                  (tds / TDS_LIMITE) * 100,
                  100
                )}%`,
              }}
            />
          </div>

          <div className="limit-row">
            <span>Límite de referencia</span>
            <strong>1,000 mg/L</strong>
          </div>
        </article>

        <article className="card">
          <p className="card-label">TURBIEDAD</p>

          <div className="metric-number">
            {turbiedad.toFixed(1)}
            <span>UNT</span>
          </div>

          <div className="meter">
            <span
              className={
                turbiedad > TURBIEDAD_LIMITE
                  ? "bar-danger"
                  : ""
              }
              style={{
                width: `${Math.min(
                  (turbiedad / 6) * 100,
                  100
                )}%`,
              }}
            />
          </div>

          <div className="limit-row">
            <span>Límite de referencia</span>
            <strong>3 UNT</strong>
          </div>
        </article>
      </section>

      <section className="control-grid">
        <article className="card valve-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CONTROL DE FLUJO</p>
              <h3>Válvula principal</h3>
            </div>

            <span
              className={`pill ${
                valvula ? "warning" : "good"
              }`}
            >
              {valvula ? "ABIERTA" : "CERRADA"}
            </span>
          </div>

          <div
            className={`valve-visual ${
              valvula ? "opened" : ""
            }`}
          >
            <div className="pipe" />

            <div className="valve-symbol">
              <span />
              <span />
            </div>

            <div className="pipe" />
          </div>

          <p className="valve-status">
            {valvula
              ? calidadCorrecta
                ? "Paso permitido (simulado)"
                : "Paso autorizado por el usuario (simulado)"
              : "Paso bloqueado (simulado)"}
          </p>

          <div className="actions">
            <button
              className={
                calidadCorrecta
                  ? "btn-open"
                  : "btn-danger"
              }
              onClick={() => cambiarValvula(true)}
              disabled={valvula}
            >
              {calidadCorrecta
                ? "Permitir paso"
                : "Permitir paso de todas formas"}
            </button>

            <button
              className="btn-close"
              onClick={() => cambiarValvula(false)}
              disabled={!valvula}
            >
              Cerrar válvula
            </button>
          </div>
        </article>

        {/* Genera detecciones aleatorias como prueba de base de datos
            Retirar una vez que tengamos los sensores detectados
            Aún hay que tener un límite de demostración para no saturar la UI 
            podríamos generar una segunda página*/}        

            <article className="card demo-card">
              <p className="eyebrow">PRUEBAS</p>
              <h3>Simulación de sensores</h3>

              <button
                className="btn-open full-button"
                onClick={simularLectura}
              >
                ↻ Simular nueva lectura
              </button>

              {mensaje && (
                <p className="feedback" role="status">
                  {mensaje}
                </p>
              )}

              <div className="reference-note">
                <strong>Referencia normativa</strong>
                <p>
                  NOM-127-SSA1-2021 · Agua para uso y consumo
                  humano.
                </p>
              </div>
            </article>
      </section>

      {/* ESTO ES PARA BASE - Lo conectaremos a una base de datos después*/}
      <section className="card history-card">
        <div className="section-heading history-heading">
          <div>
            <p className="card-label">REGISTRO DE EVENTOS</p>
            <h3>Historial de calidad del agua</h3>

            <p className="muted">
              {historial.length} registros guardados en este
              navegador
            </p>
          </div>
        </div>

        {historial.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">≋</div>
            <h4>Sin registros todavía</h4>

            <p>
              Usa “Simular nueva lectura” para generar el
              primer evento.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>TDS</th>
                  <th>Turbiedad</th>
                  <th>Estado</th>
                  <th>Evento</th>
                  <th>Válvula</th>
                </tr>
              </thead>

              <tbody>
                {historial.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fecha}</td>
                    <td>{r.tds} ppm</td>
                    <td>{r.turbiedad} UNT</td>

                    <td>
                      <span
                        className={`pill ${
                          r.estado === "Alerta"
                            ? "danger"
                            : "good"
                        }`}
                      >
                        {r.estado}
                      </span>
                    </td>

                    <td>{r.evento}</td>
                    <td>{r.valvula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>
        Tinaclear · Prototipo de monitoreo · Lecturas simuladas
      </footer>

      {mostrarConfirmacion && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelarConfirmacion();
            }
          }}
        >
          <section
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacion"
            aria-describedby="texto-confirmacion"
          >
            <div className="modal-icon">⚠</div>

            <p className="eyebrow">
              CONFIRMACIÓN DE SEGURIDAD
            </p>

            <h2 id="titulo-confirmacion">
              ¿Estás seguro?
            </h2>

            <p id="texto-confirmacion">
              Los sensores detectan valores fuera de los
              límites configurados para el agua.
            </p>

            <div className="modal-readings">
              <div>
                <span>TDS detectado</span>
                <strong>{tds} ppm</strong>
              </div>

              <div>
                <span>Turbiedad detectada</span>
                <strong>{turbiedad.toFixed(1)} UNT</strong>
              </div>
            </div>

            <p className="modal-warning">
              Si continúas, autorizarás el paso del agua a
              pesar de la alerta. El agua podría representar
              un riesgo para la salud. Estas mediciones no
              garantizan que sea segura para el consumo.
            </p>

            <div className="modal-actions">
              <button
                className="btn-close"
                onClick={cancelarConfirmacion}
              >
                No, mantener cerrada
              </button>

              <button
                className="btn-danger"
                onClick={confirmarPasoContaminado}
              >
                Sí, permitir el paso
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
