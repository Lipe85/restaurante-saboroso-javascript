let conn = require('./db');

class Pagination{

    constructor(
        query,
        params = [],
        itemsPerPage = 10
    ){

        this.query = query;
        this.params = params;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
    }

    getPage(page){

        this.currentPage = page - 1;

        this.params.push(
            this.currentPage * this.itemsPerPage,
            this.itemsPerPage
        );

        return new Promise((resolve, reject)=>{

            conn.query([this.query, "SELECT FOUND_ROWS() AS FOUND_ROWS"].join(";"), this.params, (err, results)=>{

                if(err){
                    reject(err);
                }else{

                    this.data = results[0];
                    this.total = results[1][0].FOUND_ROWS,
                    this.totalPages = Math.ceil(this.total / this.itemsPerPage);
                    this.currentPage++;

                    resolve(this.data);
                }

            })

        });

    }

    getTotal(){
        return this.total;
    }

    getCurrentPage(){
        return this.currentPage;
    }

    getTotalPages(){
        return this.totalPages;
    }

    getNavigation(params){

        let limiPageNav = 5;
        let links = [];
        let nrStart = 0;
        let nrEnd = 0
        
        if(this.getTotalPages() < limiPageNav ){
            this.limiPageNav = this.getTotalPages();
        }

        //se estamos nas primeira páginas
        
        if(this.getCurrentPage() - (parseInt(limiPageNav / 2)) < 1){
            
            nrStart = 1;
            nrEnd = limiPageNav;
        }
        //Estamos chegando nas últimas páginas
        else if((this.getCurrentPage() + parseInt(limiPageNav/2)) > this.getTotalPages()){
            nrStart = this.getTotalPages() - limiPageNav;
            nrEnd = this.getTotalPages();
        }
        //meio navegação
        else{
            nrStart = this.getCurrentPage() - parseInt(limiPageNav/2);
            nrEnd = this.getCurrentPage() + parseInt(limiPageNav/2);
        }

        if(this.getCurrentPage() > 1){

            links.push({
                text: '<',
                href: '?' + this.getQueryString(Object.assign({}, params, {page: this.getCurrentPage()-1}))
            });

        }

        for(let x = nrStart; x <= nrEnd; x++){

            links.push({
                text: x,
                href: '?' + this.getQueryString(Object.assign({}, params, {page: x})),
                active: (x === this.getCurrentPage())
            });
            
        }

        if(this.getCurrentPage() < this.getTotalPages()){

            links.push({
                text: '>',
                href: '?' + this.getQueryString(Object.assign({}, params, {page: this.getCurrentPage()+1}))
            });

        }
        
        return links;

    }

    getQueryString(params){

        let queryString = [];

        for(let name in params){

            queryString.push(`${name}=${params[name]}`);

        }

        return queryString.join("&");

    }

}

module.exports = Pagination;