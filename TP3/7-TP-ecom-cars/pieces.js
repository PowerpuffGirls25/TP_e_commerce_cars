const { createApp } = Vue;
createApp({
    data() {
        return {
            pieces: [],
            panier: [],
            recherche: '',
            categorie: '',
            disponible: '',
            tri: ''
        };
    },
    async mounted() {
        const response = await fetch('pieces-autos.json');
        this.pieces = await response.json();
    },
    computed: {
        categories() {
            // Obtenir un tableau unique de catégories
            return [...new Set(this.pieces.map(piece => piece.categorie))];
        },
        piecesFiltrees() {
            let result = this.pieces;

            if (this.recherche) {
                result = result.filter(piece =>
                    piece.nom.toLowerCase().includes(this.recherche.toLowerCase())
                );
            }

            if (this.categorie) {
                result = result.filter(piece =>
                    piece.categorie === this.categorie && piece.disponible === true)

            }
            return result;
        }
    },
    /**
     * 
     */
    methods: {
        trierPrix() {
            if (this.tri === 'desc') {
                this.piecesFiltrees.sort((a, b) => b.prix - a.prix);
                return;
            }
            this.piecesFiltrees.sort((a, b) => a.prix - b.prix);
        },
       ajouterAuPanier(piece) {
    this.panier.push(piece);
    localStorage.setItem("panier", JSON.stringify(this.panier));
}

    }
    

}).mount('#app');