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
* `/patient/:id/default_address/`
    * type : PUT
    * mandatory params : "addressId"
    * public : false
* `/patient/:id/remove_address/`
    * type : DELETE
    * mandatory params : "addressId"
    * public : false
* `/patient/:id/new_address/`
    * type : POST
    * mandatory params : "title","street","city","postCode"
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
    * mandatory params : "patient_id","start","end","note"
    * optional params : "addressId"
    * public : false
* `/event/:id`
    * type : DELETE
    * public : false
* `/event/`
    * type : POST
    * mandatory params : "patient_id","start","end","user_id","author_id"
    * public : false
    
## Address

* `/address/:id`
    * type : GET
* `/address/search/patient/:id`
    * type : GET
    * public : false
* `/address/trajet/`
    * type : GET
    * mandatory params : "address_id_ori","address_id_dest","distance","distance_m","duration","duration_s"
    * public : false

## Memos

* `/memo/search/patient/:id`
    * type : GET
    * optional params : "read", "active"
    * public : false
* `/memo/:id`
    * type : GET
    * public : false
* `/memo/:id`
    * type : POST
    * mandatory params : "patient_id","content","author_id"
    * public : false
* `/memo/:id`
    * type : DELETE
    * public : false
* `/memo/:id/read`
    * type : PUT
    * mandatory params : "value"
    * public : false
* `/memo/`
    * type : PUT
    * mandatory params : "content"
    * public : false
   
## Rapport

* `/report/count_time/:userId`
    * mandatory params : "start","end"
    * type : GET
    * public : false
* `/report/heat/:userId`
    * mandatory params : "start","end"
    * type : GET
    * public : false
* `/report/trajet/:userId`
    * mandatory params : "start","end"
    * type : GET
    * public : false
* `/report/synth_user_patient`
    * mandatory params : "userId", "patientId", "dateStart", "dateEnd"
    * type : GET
    * public : false
    
## Actions

* `/actions/search/event/`
    * mandatory params : "event_id"
    * type : GET
* `/actions/`
    * mandatory params : "event_id","action_type_id","action_sub_type_id","comment","author_id"
    * type : POST
    * public : false
* `/actions/type/`
    * type : GET
    * public : false
* `/actions/sub_type/`
    * type : GET
    * public : false
* `/actions/:id`
    * type : DELETE
    * public : false
