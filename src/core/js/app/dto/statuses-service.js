/*
 Statuses Service
 */
;(function() {
    'use strict';

    /**
     * Statuses Service
     */
    jQuery.fn.jplist.StatusesService = jQuery.fn.jplist.StatusesService || {};

    /**
     * Get statuses by action
     * @param {string} action
     * @param {Array.<jQuery.fn.jplist.StatusDTO>} statuses
     * @return {Array.<jQuery.fn.jplist.StatusDTO>}
     */
    jQuery.fn.jplist.StatusesService.getStatusesByAction = function(action, statuses){

        var resultStatuses = []
            ,status;

        for(var i=0; i<statuses.length; i++){

            //get status
            status = statuses[i];

            if(status.action === action){
                resultStatuses.push(status);
            }
        }

        return resultStatuses;
    };

    /**
     * get all sort statuses, expand statuses group if needed
     * @param {Array.<jQuery.fn.jplist.StatusDTO>} statuses
     * @return {Array.<jQuery.fn.jplist.StatusDTO>}
     */
    jQuery.fn.jplist.StatusesService.getSortStatuses = function(statuses){

        var actionStatuses
            ,actionStatus
            ,statusesAfterGroupExpanding = []
            ,tempStatus;

        //get sort statuses
        actionStatuses = jQuery.fn.jplist.StatusesService.getStatusesByAction('sort', statuses);

        if(jQuery.isArray(actionStatuses)){

            for(var i=0; i<actionStatuses.length; i++){

                actionStatus = actionStatuses[i];

                if(actionStatus &&
                    actionStatus.data &&
                    actionStatus.data['sortGroup'] &&
                    jQuery.isArray(actionStatus.data['sortGroup']) &&
                    actionStatus.data['sortGroup'].length > 0){

                    for(var j=0; j<actionStatus.data['sortGroup'].length; j++){

                        tempStatus = new jQuery.fn.jplist.StatusDTO(
                            actionStatus.name
                            ,actionStatus.action
                            ,actionStatus.type
                            ,actionStatus.data['sortGroup'][j]
                            ,actionStatus.inStorage
                            ,actionStatus.inAnimation
                            ,actionStatus.isAnimateToTop
                            ,actionStatus.inDeepLinking
                        );

                        statusesAfterGroupExpanding.push(tempStatus);
                    }
                }
                else{
                    statusesAfterGroupExpanding.push(actionStatus);
                }
            }
        }

        return statusesAfterGroupExpanding;
    };

    /**
     * get all filter statuses that have registered filter services
     * @param {Array.<jQuery.fn.jplist.StatusDTO>} statuses
     * @return {Array.<jQuery.fn.jplist.StatusDTO>}
     */
    jQuery.fn.jplist.StatusesService.getFilterStatuses = function(statuses){

        var filterStatuses
            ,status
            ,filterService
            ,registeredFilterStatuses = [];

        //get filter statuses
        filterStatuses = jQuery.fn.jplist.StatusesService.getStatusesByAction('filter', statuses);

        if(jQuery.isArray(filterStatuses)){

            for(var i=0; i<filterStatuses.length; i++){

                //get status
                status = filterStatuses[i];

                if(status && status.data && status.data.filterType){

                    //get filter service
                    filterService = jQuery.fn.jplist.DTOMapperService.filters[status.data.filterType];

                    if(jQuery.isFunction(filterService)){

                        registeredFilterStatuses.push(status);
                    }
                }
            }
        }

        return registeredFilterStatuses;
    };

    /**
     * Get statuses with the same field: value
     * @param {Array.<jQuery.fn.jplist.StatusDTO>} statuses
     * @param {string} field
     * @param {string|null} value
     * @return {Array.<jQuery.fn.jplist.StatusDTO>}
     */
    var getStatusesByFieldAndValue = function(statuses, field, value){

        var resultStatuses = []
            ,status;

        for(var i=0; i<statuses.length; i++){

            //get status
            status = statuses[i];

            if(status[field] === value){
                status.initialIndex = i;
                resultStatuses.push(status);
            }
        }

        return resultStatuses;
    };

    /**
     * add status
     * @param {Array.<jQuery.fn.jplist.StatusDTO>} statuses
     * @param {jQuery.fn.jplist.StatusDTO} status
     * @param {boolean} force - if this status should be prefered on other statuses
     */
    jQuery.fn.jplist.StatusesService.add = function(statuses, status, force){

        var currentStatus
            ,statusesWithTheSameAction
            ,statusesWithTheSameActionAndName;

        if(statuses.length === 0){
            statuses.push(status);
        }
        else{

            statusesWithTheSameAction = getStatusesByFieldAndValue(statuses, 'action', status.action);

            if(statusesWithTheSameAction.length === 0){

                statuses.push(status);
            }
            else{
                statusesWithTheSameActionAndName = getStatusesByFieldAndValue(statusesWithTheSameAction, 'name', status.name);

                if(statusesWithTheSameActionAndName.length === 0){

                    statuses.push(status);
                }
                else{

                    for(var i = 0; i<statusesWithTheSameActionAndName.length; i++){

                        currentStatus = statusesWithTheSameActionAndName[i];

                        if(currentStatus.type === status.type){

                            if(force){
                                statuses[currentStatus.initialIndex] = status;
                            }

                            /*
                             else{

                             //warn ...
                             if(currentStatus.data && status.data){

                             shouldWarn = false;
                             warnProperties = [];

                             jQuery.each(currentStatus.data, function(property, value){

                             if(status[property] !== value){
                             shouldWarn = true;
                             warnProperties.push(property + ': ' + status[property] + ' !== ' + value);
                             }
                             });

                             if(shouldWarn){

                             jQuery.fn.jplist.warn(context.options, 'The statuses have the same name, action and type, but different data values', [currentStatus, status, warnProperties]);
                             }
                             }
                             }*/
                        }
                        else{
                            //merge
                            statuses[currentStatus.initialIndex] = jQuery.extend(true, {}, currentStatus, status);
                            statuses[currentStatus.initialIndex].type = 'combined';
                        }
                    }
                }
            }
        }
    };

})();