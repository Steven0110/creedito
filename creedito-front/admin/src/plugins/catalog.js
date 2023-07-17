import Vue from 'vue'

const catalog = {
    ine_anverso: {
        name: "INE o Pasaporte (Anverso)",
        type: "ine_anverso",
        description: "Fotografía de la parte frontal del documento de identificación",
        accept: "image/*",
        uploadText: "Da click o arrastra una imagen",
        helper: {
            images: [
                "/assets/images/helper01.jpg",
                "/assets/images/helper02.jpg",
            ],
            title: "Guía para captura de documentos"
        },
        required: true
    },
    ine_reverso: {
        name: "INE o Pasaporte (Reverso)",
        type: "ine_reverso",
        description: "Fotografía de la parte trasera del documento de identificación.",
        accept: "image/*",
        uploadText: "Da click o arrastra una imagen",
        helper: {
            images: [
                "/assets/images/helper01.jpg",
                "/assets/images/helper02.jpg",
            ],
            title: "Guía para captura de documentos"
        },
        required: true
    },
    escritura_propiedad: {
        name: "Escritura de propiedad",
        type: "escritura_propiedad",
        description: "Escritura en PDF de la propiedad en la que se pretende llevar a cabo el desarrollo.",
        accept: "application/pdf",
        uploadText: "Da click o arrastra un PDF",
        required: true
    },
    posesion_material: {
        name: "Evidencia de posesión",
        type: "posesion_material",
        description: "Evidencia en formato de video de la posesión material.",
        accept: "video/*,",
        uploadText: "Da click o arrastra un video",
        required: true
    },
    escritura_propiedad_colateral: {
        name: "Escritura de propiedad (colateral)",
        type: "escritura_propiedad_colateral",
        description: "Escritura de la propiedad en formato PDF que se usará como colateral, en caso de ser la misma propiedad que la del desarrollo este requerimiento se omite.",
        accept: "application/pdf",
        uploadText: "Da click o arrastra un PDF",
        required: false
    },
    certificado_libertad_gravamen: {
        name: "Certificado de libertad de gravamen",
        type: "certificado_libertad_gravamen",
        description: "Certificado en formato PDF de libertad de gravamen emitido por el registro público de la propiedad y comercio.",
        accept: "application/pdf",
        uploadText: "Da click o arrastra un PDF",
        required: true
    },
    extincion_expropiacion: {
        name: "No extinción de dominio o expropiación",
        description: "Documento en formato PDF que acredite la ausencia de procedimientos de extinción de dominio o expropiación en curso.",
        type: "extincion_expropiacion",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    plan_negocios: {
        name: "Plan de negocios",
        description: "Plan de negocios en formato PDF del proyecto.",
        type: "plan_negocios",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    estudio_mercado: {
        name: "Estudio de mercado",
        description: "Estudio de mercado en formato PDF del proyecto.",
        type: "estudio_mercado",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    estudio_viabilidad: {
        name: "Estudio de viabilidad técnica",
        description: "Estudio de viabilidad técnica en formato PDF del proyecto",
        type: "estudio_viabilidad",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    estado_resultados: {
        name: "Estado de resultados",
        type: "estado_resultados",
        description: "Documento en formato PDF donde se muestre el Estado de Resultados de tres años anteriores y pronóstico de 3 años posteriores.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    estado_flujos: {
        name: "Estado de flujos de efectivo",
        type: "estado_flujos",
        description: "Documento en formato PDF del Estado de flujos de efectivo de tres años anteriores y pronóstico de 3 años posteriores",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    balance_general: {
        name: "Balance general",
        type: "balance_general",
        description: "Documento en formato PDF del Balance General de tres años anteriores y pronóstico de 3 años posteriores.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    reporte_credito: {
        name: "Reporte de crédito especial",
        type: "reporte_credito",
        description: "Documento en formato PDF del Reporte de Crédito especial",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    curriculum_vitae: {
        name: "Curriculum Vitae",
        type: "curriculum_vitae",
        description: "Curriculum Vitae en formato PDF.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    cedula_profesional: {
        name: "Cédula Profesional",
        type: "cedula_profesional",
        description: "Curriculum Vitae en formato PDF.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    evidencia_historial: {
        name: "Evidencia histórica",
        type: "evidencia_historial",
        description: "Documento en formato PDF que avale construcciones pasadas, historial de negocio, ejecución y empalme de personas al mando de proyectos pasados con mandos presentes y futuros del desarrollo a financiar.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    documento_personal: {
        name: "Documento del personal",
        type: "documento_personal",
        description: "Documentación en formato PDF del personal que llevará supervisión, ejecución y dirección de la obra de certificaciones relacionadas con servicios especializados de la industria.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    permiso: {
        name: "Permiso",
        type: "permiso",
        description: "Licencia, permiso, uso de suelo, zonificación, suministros de agua y drenaje, en formato PDF",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    viabilidad_financiera: {
        name: "Viabilidad financiera",
        type: "viabilidad_financiera",
        description: "Documento en formato PDF que muestre el escenario de viabilidad financiera considerando escenarios de estrés en el mercado inmobiliario con especial atención en la afectación en la capacidad de pago del solicitante y los ingresos estimados, así como la elasticidad de sus precios finales al consumidor.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: true
    },
    valuacion: {
        name: "Valuación",
        type: "valuacion",
        description: "Documento en formato PDF de la valuación realizada por un perito valuador.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: false
    },
    estudio_mercado_extrapolacion: {
        name: "Valuación",
        type: "valuacion",
        description: "Documento en formato PDF que contenga el Estudio de mercado actualizado para realizar extrapolación de valores en el mercado.",
        uploadText: "Da click o arrastra un PDF",
        accept: "application/pdf",
        required: false
    }
}

Vue.prototype.$catalog = catalog

export default {}