# Routes

## Patient

* `/patient/`
    * type : GET
    * public : true
* `/patient/`
    * type : POST
    * mandatory params : "name_first","name_last","user_id"
    * public : false
    
## Event

* `/event/search/user/:userId`
    * type : GET
    * mandatory params : "start", "end"
    * public : true