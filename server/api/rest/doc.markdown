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
* `/event/:id`
    * type : GET
    * public : false
* `/event/:id`
    * type : PUT
    * mandatory params : "patient_id","start","end"
    * public : false
* `/event/:id`
    * type : DELETE
    * public : false
* `/event/`
    * type : POST
    * mandatory params : "patient_id","start","end","user_id","author_id"
    * public : false