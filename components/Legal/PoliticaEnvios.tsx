import React from 'react';
import LegalLayout from './LegalLayout';

const PoliticaEnvios = () => {
    return (
        <LegalLayout title="Política de Envíos y Devoluciones">
            <p className="text-sm text-gray-400">Última actualización: Enero 2026</p>

            <h3>1. Política de Envíos</h3>
            <p>
                Realizamos envíos a todo el territorio nacional de Colombia.
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Tiempos de Entrega:</strong> El tiempo estimado de entrega es de 2 a 5 días hábiles para ciudades principales y hasta 8 días hábiles para destinos reexpedidos o zonas rurales.</li>
                <li><strong>Costos:</strong> El costo del envío se calcula al momento del checkout según la ciudad de destino y el peso del paquete. Envíos gratis pueden aplicar según promociones vigentes.</li>
                <li><strong>Transportadora:</strong> Utilizamos empresas transportadoras certificadas (como Interrapidísimo, Servientrega, Coordinadora). Una vez despachado, recibirá un número de guía para rastrear su pedido.</li>
            </ul>

            <h3>2. Estado del Pedido</h3>
            <p>
                Una vez confirmado el pago, su pedido entrará en proceso de alistamiento (1-2 días hábiles). Recibirá notificaciones vía correo electrónico en cada etapa: Confirmación de Pago, Pedido Enviado (con guía) y Pedido Entregado.
            </p>

            <h3>3. Política de Devoluciones y Retracto</h3>

            <div className="border-l-4 border-red-500 pl-4 py-4 bg-red-50 my-6">
                <h4 className="text-red-700 font-bold m-0 uppercase text-sm">Importante: Productos de Uso Personal</h4>
                <p className="text-sm m-0 mt-1 text-red-800">
                    Por razones de higiene y seguridad sanitaria, y de conformidad con la normativa colombiana, <strong>NO se aceptan cambios ni devoluciones de productos cosméticos, cremas, sueros o productos de cuidado personal que hayan sido abiertos, cuyos sellos de seguridad estén rotos o que muestren señales de uso.</strong>
                </p>
            </div>

            <p>
                El derecho de retracto solo aplicará si el producto se devuelve en las <strong>mismas condiciones exactas</strong> en las que fue recibido: completamente sellado, sin abrir y con su empaque original intacto, dentro de los 5 días hábiles siguientes a la entrega. Los costos de transporte por retracto corren por cuenta del cliente.
            </p>

            <h3>4. Garantía y Productos Defectuosos</h3>
            <p>
                Si recibe un producto defectuoso, dañado durante el transporte o incorrecto, debe notificarlo a nuestro equipo de soporte dentro de las <strong>48 horas siguientes</strong> a la recepción del paquete.
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Envíe un correo a <strong>contacto@rostrodorado.com</strong> con el número de pedido y FOTOS/VIDEO claros del producto y el empaque.</li>
                <li>Si se aprueba la garantía, Rostro Dorado Clinic asumirá los costos de recogida y reposición del producto.</li>
            </ul>

            <h3>5. Reembolsos</h3>
            <p>
                Los reembolsos aprobados (por falta de stock o garantía válida) se procesarán en un plazo de hasta 15 días hábiles a la cuenta bancaria indicada por el cliente o mediante reversión a la tarjeta de crédito utilizada.
            </p>

            <h3>6. Excepciones</h3>
            <p>
                No se aceptan devoluciones por "no me gustó el olor/textura" o reacciones alérgicas individuales no reportadas previamente, ya que los resultados pueden variar y dependen del uso correcto. Recomendamos leer siempre los ingredientes antes de comprar.
            </p>
        </LegalLayout>
    );
};

export default PoliticaEnvios;
