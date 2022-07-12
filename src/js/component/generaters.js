// A generator for acquiring play volume & comment volume of Ytb videos
class YtbInfoGenerator {
    #popularity;
    playVolume;
    commentVolume;

    constructor() {
        this.#popularity = Math.floor(Math.random() * 100);
        this.#generatePlayVolume();
        this.#generateCommentVolume();
    }

    #getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * [0, 40) -> [5000, 8w)
     * [40, 80) -> [8w, 20w)
     * [80, 100) -> [20w, 50w)
     */
    #generatePlayVolume() {
        if (this.#popularity < 40) {
            this.playVolume = this.#getRandomInt(5000, 80000);
        } else if (this.#popularity >= 40 && this.#popularity < 80) {
            this.playVolume = this.#getRandomInt(80000, 200000);
        } else {
            this.playVolume = this.#getRandomInt(200000, 500000);
        }

    }

    /**
     * [0, 40) -> [0, 100)
     * [40, 80) -> [100, 500)
     * [80, 100) -> [500, 3000)
     */
    #generateCommentVolume() {
        if (this.#popularity < 40) {
            this.commentVolume = this.#getRandomInt(0, 100);
        } else if (this.#popularity >= 40 && this.#popularity < 80) {
            this.commentVolume = this.#getRandomInt(100, 500);
        } else {
            this.commentVolume = this.#getRandomInt(500, 3000);
        }
    }

}

// A calculator for calculating comprehensive point
class CompreCaculator {
    ahpWeight;
    productEigen;
    cPoint;

    constructor(aw, data) {
        this.ahpWeight = aw;
        this.productEigen = data;
        this.cPoint = this.getCPoint();
    }

    /**
     * 
     * @returns the score for similarity
     */
    getSIPoint() {
        return this.productEigen.si * 100;
    }

    /**
     * 
     * @returns the score for rating
     */
    getRAPoint() {
        return this.productEigen.ra / 5 * 100;
    }

    /**
     * 
     * @returns the score for number of reviews
     */
    getNRPoint() {
        return this.productEigen.nr > 10000 ? 100 : this.productEigen.nr / 10000 * 100;
    }

    /**
     * 
     * @returns the score for number of video reviews
     */
    getNVRPoint() {
        return this.productEigen.nvr / 5000 * 100;
    }

    /**
     * 
     * @returns the score for number of video plays
     */
    getNVPPoint() {
        return this.productEigen.nvp / 1000000 * 100;
    }

    /**
     * 
     * @returns comprehensive score of AHP
     */
    getCPoint() {
        return this.ahpWeight.si * this.getSIPoint()
            + this.ahpWeight.ra * this.getRAPoint()
            + this.ahpWeight.nr * this.getNRPoint()
            + this.ahpWeight.nvr * this.getNVRPoint()
            + this.ahpWeight.nvp * this.getNVPPoint();
    }
}