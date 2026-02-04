// Define materials and their sustainability scores
const MATERIALS = {
    "cotton": {
        score: 60,
        category: "moderate"
    },
    "organic cotton": {
        score: 80,
        category: "sustainable"
    },
    "recycled cotton": {
        score: 85,
        category: "sustainable"
    },
    "polyester": {
        score: 40,
        category: "synthetic"
    },
    "recycled polyester": {
        score: 70,
        category: "sustainable"
    },
    "wool": {
        score: 65,
        category: "moderate"
    },
    "rws wool": {
        score: 80,
        category: "sustainable"
    },
    "recycled wool": {
        score: 85,
        category: "sustainable"
    },
    "silk": {
        score: 55,
        category: "animal_welfare"
    },
    "linen": {
        score: 85,
        category: "regenerative"
    },
    "viscose": {
        score: 45,
        category: "moderate"
    },
    "lenzing ecovero": {
        score: 75,
        category: "sustainable"
    },
    "lenzing ecovero viscose": {
        score: 75,
        category: "sustainable"
    },
    "tencel": {
        score: 85,
        category: "sustainable"
    },
    "lyocell": {
        score: 85,
        category: "sustainable"
    },
    "modal": {
        score: 75,
        category: "sustainable"
    },
    "elastane": {
        score: 30,
        category: "synthetic"
    },
    "spandex": {
        score: 30,
        category: "synthetic"
    },
    "nylon": {
        score: 35,
        category: "synthetic"
    },
    "recycled nylon": {
        score: 65,
        category: "sustainable"
    },
    "rayon": {
        score: 45,
        category: "moderate"
    },
    "acrylic": {
        score: 25,
        category: "synthetic"
    },
    "cashmere": {
        score: 50,
        category: "animal_welfare"
    },
    "recycled cashmere": {
        score: 80,
        category: "sustainable"
    },
    "leather": {
        score: 40,
        category: "animal_welfare"
    },
    "recycled leather": {
        score: 75,
        category: "sustainable"
    },
    "bamboo": {
        score: 70,
        category: "regenerative"
    },
    "hemp": {
        score: 90,
        category: "regenerative"
    },
    "jute": {
        score: 85,
        category: "regenerative"
    },
    "kapok": {
        score: 80,
        category: "regenerative"
    },
    "alpaca": {
        score: 60,
        category: "animal_welfare"
    },
    "mohair": {
        score: 45,
        category: "animal_welfare"
    },
    "down": {
        score: 35,
        category: "animal_welfare"
    },
    "angora": {
        score: 30,
        category: "animal_welfare"
    },
    "recycled down": {
        score: 70,
        category: "sustainable"
    },
    "cork": {
        score: 95,
        category: "regenerative"
    },
    "piñatex": {
        score: 85,
        category: "regenerative"
    },
    "econyl": {
        score: 75,
        category: "sustainable"
    },
    "cupro": {
        score: 65,
        category: "moderate"
    },
    "ramie": {
        score: 75,
        category: "regenerative"
    },
    "acetate": {
        score: 40,
        category: "synthetic"
    },
    "triacetate": {
        score: 35,
        category: "synthetic"
    },
    "polyamide": {
        score: 35,
        category: "synthetic"
    },
    "polypropylene": {
        score: 30,
        category: "synthetic"
    },
    "pvc": {
        score: 20,
        category: "synthetic"
    },
    "polyurethane": {
        score: 25,
        category: "synthetic"
    },
    "mako cotton": {
        score: 65,
        category: "moderate"
    },
    // Cotton variants
    "pima cotton": {
        score: 80,
        category: "sustainable"
    },
    "bci cotton": {
        score: 70,
        category: "sustainable"
    },
    "supima cotton": {
        score: 80,
        category: "sustainable"
    },
    // Recycled variants
    "recycled viscose": {
        score: 70,
        category: "sustainable"
    },
    "recycled polyamide": {
        score: 55,
        category: "sustainable"
    },
    // Natural fibers
    "sisal": {
        score: 75,
        category: "regenerative"
    },
    "abaca": {
        score: 75,
        category: "regenerative"
    },
    "coir": {
        score: 70,
        category: "regenerative"
    },
    // Synthetic variants
    "elastomultiester": {
        score: 30,
        category: "synthetic"
    },
    "modacrylic": {
        score: 30,
        category: "synthetic"
    },
    "elastodiene": {
        score: 25,
        category: "synthetic"
    },
    // Branded/Specialty materials
    "tencel modal": {
        score: 80,
        category: "sustainable"
    },
    "sorona": {
        score: 65,
        category: "moderate"
    },
    "repreve": {
        score: 65,
        category: "sustainable"
    },
    "pinatex": {
        score: 80,
        category: "regenerative"
    }
};

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.MATERIALS = MATERIALS;
} else {
    module.exports = MATERIALS;
} 