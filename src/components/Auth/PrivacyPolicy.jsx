// src/components/Auth/PrivacyPolicy.jsx
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-r from-blue-100 to-blue-300 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl transform transition duration-500  my-8">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">Políticas de Privacidad</h1>

        <p className="text-gray-700 mb-4">Última actualización: 25 de julio de 2025</p>

        <p className="text-gray-700 mb-6">
          Bienvenido a Padel Pro Ranking, una plataforma dedicada a la gestión de torneos de pádel, estadísticas de jugadores y seguimiento de partidos. En Padel Pro Ranking, la privacidad de nuestros usuarios es de suma importancia. Esta política de privacidad describe cómo recopilamos, usamos, divulgamos y protegemos su información personal.
        </p>
        <p className="text-gray-700 mb-6">
          Al utilizar nuestros servicios, usted acepta la recopilación y el uso de la información de acuerdo con esta política.
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">1. Información que Recopilamos</h2>
        <p className="text-gray-700 mb-4">
          Recopilamos varios tipos de información para proporcionar y mejorar nuestros servicios:
        </p>

        <h3 className="text-2xl font-semibold text-blue-600 mb-3">Información Personal Identificable (PII)</h3>
        <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
          <li className="mb-2"><strong>Datos de Registro:</strong> Cuando se registra en nuestra aplicación, recopilamos su nombre de usuario, dirección de correo electrónico y contraseña.</li>
          <li className="mb-2"><strong>Datos del Perfil del Jugador:</strong> Para la gestión de torneos y estadísticas, podemos recopilar su nombre, apellido, número de teléfono, fecha de nacimiento, sexo, ranking general, club y categoría.</li>
          <li className="mb-2"><strong>Datos de Parejas:</strong> Información relacionada con sus parejas de juego (nombres de los compañeros).</li>
        </ul>

        <h3 className="text-2xl font-semibold text-blue-600 mb-3">Datos de Uso</h3>
        <p className="text-gray-700 mb-6">
          Recopilamos automáticamente información sobre cómo se accede y utiliza el Servicio ("Datos de Uso"). Estos Datos de Uso pueden incluir información como la dirección de Protocolo de Internet de su computadora (por ejemplo, dirección IP), tipo de navegador, versión del navegador, las páginas de nuestro Servicio que visita, la hora y fecha de su visita, el tiempo que pasa en esas páginas, identificadores únicos de dispositivos y otros datos de diagnóstico.
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">2. Uso de la Información</h2>
        <p className="text-gray-700 mb-4">
          Padel Pro Ranking utiliza la información recopilada para diversos fines:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 ml-4">
          <li className="mb-2"><strong>Para proporcionar y mantener nuestro Servicio:</strong> Esto incluye la gestión de su cuenta, la facilitación de la inscripción en torneos, el seguimiento de partidos y la visualización de estadísticas.</li>
          <li className="mb-2"><strong>Para notificarle sobre cambios en nuestro Servicio:</strong> Le mantendremos informado sobre actualizaciones importantes o cambios en las funcionalidades.</li>
          <li className="mb-2"><strong>Para permitirle participar en funciones interactivas de nuestro Servicio:</strong> Esto incluye la interacción con otros jugadores y la participación en torneos.</li>
          <li className="mb-2"><strong>Para proporcionar soporte al cliente:</strong> Para ayudarle con cualquier consulta o problema que pueda tener.</li>
          <li className="mb-2"><strong>Para monitorear el uso de nuestro Servicio:</strong> Para analizar cómo se utiliza la aplicación y mejorar la experiencia del usuario.</li>
          <li className="mb-2"><strong>Para detectar, prevenir y abordar problemas técnicos:</strong> Para asegurar el buen funcionamiento de la aplicación.</li>
          <li className="mb-2"><strong>Para enviarle notificaciones por correo electrónico:</strong> Si ha optado por recibirlas, le enviaremos notificaciones relacionadas con sus partidos, torneos y actualizaciones relevantes de la aplicación.</li>
        </ul>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">3. Notificaciones por Correo Electrónico</h2>
        <p className="text-gray-700 mb-4">
          En Padel Pro Ranking, entendemos la importancia de mantener a los jugadores informados sobre sus actividades en la plataforma. Por ello, ofrecemos la opción de recibir notificaciones por correo electrónico sobre:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
          <li className="mb-2"><strong>Recordatorios de partidos:</strong> Próximos partidos en los que está inscrito.</li>
          <li className="mb-2"><strong>Actualizaciones de torneos:</strong> Cambios en horarios, cuadros o resultados de torneos.</li>
          <li className="mb-2"><strong>Resultados de partidos:</strong> Notificaciones sobre los resultados de los partidos en los que ha participado.</li>
          <li className="mb-2"><strong>Actualizaciones generales de la aplicación:</strong> Novedades, características o información importante de la plataforma.</li>
        </ul>
        <p className="text-gray-700 mb-4">
          <strong>Consentimiento para Notificaciones:</strong> Al registrarse, tendrá la opción de aceptar recibir estas notificaciones. Si no marca esta casilla, no recibirá correos electrónicos de notificaciones de nuestra parte.
        </p>
        <p className="text-gray-700 mb-6">
          <strong>Gestión de Preferencias de Notificación:</strong> Puede cambiar sus preferencias de notificación en cualquier momento desde la sección de su perfil dentro de la aplicación. Si decide desactivar las notificaciones, se le presentará una advertencia para confirmar su decisión, ya que esto podría significar perderse información importante sobre sus partidos y torneos.
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">4. Divulgación de Información</h2>
        <p className="text-gray-700 mb-4">
          Padel Pro Ranking no vende, comercializa ni alquila su información personal identificable a terceros. Podemos compartir información con:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 ml-4">
          <li className="mb-2"><strong>Proveedores de Servicios:</strong> Podemos emplear a empresas e individuos de terceros para facilitar nuestro Servicio, proporcionar el Servicio en nuestro nombre, realizar servicios relacionados con el Servicio o ayudarnos a analizar cómo se utiliza nuestro Servicio. Estos terceros tienen acceso a su Información Personal solo para realizar estas tareas en nuestro nombre y están obligados a no divulgarla ni utilizarla para ningún otro propósito.</li>
          <li className="mb-2"><strong>Cumplimiento Legal:</strong> Podemos divulgar su Información Personal cuando así lo exija la ley o en respuesta a solicitudes válidas de autoridades públicas (por ejemplo, un tribunal o una agencia gubernamental).</li>
        </ul>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">5. Seguridad de los Datos</h2>
        <p className="text-gray-700 mb-6">
          La seguridad de sus datos es importante para nosotros, pero recuerde que ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por utilizar medios comercialmente aceptables para proteger su Información Personal, no podemos garantizar su seguridad absoluta.
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">6. Enlaces a Otros Sitios</h2>
        <p className="text-gray-700 mb-6">
          Nuestro Servicio puede contener enlaces a otros sitios que no son operados por nosotros. Si hace clic en un enlace de un tercero, será dirigido a ese sitio de un tercero. Le recomendamos encarecidamente que revise la Política de Privacidad de cada sitio que visite.
        </p>
        <p className="text-gray-700 mb-6">
          No tenemos control ni asumimos ninguna responsabilidad por el contenido, las políticas de privacidad o las prácticas de los sitios o servicios de terceros.
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">7. Privacidad de los Niños</h2>
        <p className="text-gray-700 mb-6">
          Nuestro Servicio no se dirige a ninguna persona menor de 18 años ("Niños").
        </p>
        <p className="text-gray-700 mb-6">
          No recopilamos a sabiendas información personal identificable de ninguna persona menor de 18 años. Si usted es padre o tutor y sabe que su hijo nos ha proporcionado Datos Personales, contáctenos. Si nos damos cuenta de que hemos recopilado Datos Personales de niños sin verificación del consentimiento de los padres, tomamos medidas para eliminar esa información de nuestros servidores.
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">8. Cambios a Esta Política de Privacidad</h2>
        <p className="text-gray-700 mb-6">
          Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página.
        </p>
        <p className="text-gray-700 mb-6">
          Le recomendamos que revise esta Política de Privacidad periódicamente para cualquier cambio. Los cambios a esta Política de Privacidad son efectivos cuando se publican en esta página.
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mb-4">9. Contáctenos</h2>
        <p className="text-gray-700 mb-4">
          Si tiene alguna pregunta sobre esta Política de Privacidad, contáctenos:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 ml-4">
          <li className="mb-2">Por correo electrónico: padelprorank@gmail.com</li>
          <li className="mb-2">Visitando esta página en nuestro sitio web: https://play.google.com/store/apps/details/Contacts?id=com.contapps.android&hl=es_PA</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
