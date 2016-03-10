# Routes

## Patient

* `/patient/`
    * type : GET
    * public : false
* `/patient/:id`
    * type : GET
    * public : false
* `/patient/:id`
    * type : PUT
    * mandatory params : "name_first","name_last","active"
    * public : false
* `/patient/`
    * type : POST
    * mandatory params : "name_first","name_last","user_id"
    * public : false
    
## Event

* `/event/search/user/:userId`
    * type : GET
    * mandatory params : "start", "end"
    * public : false