/*
============================================================

 SayBon Asset Manager

 asset-manager.js

 Phase C1
 Engine Skeleton

============================================================
*/

import AssetConfig from "./asset-config.js";
import AssetRegistry from "./asset-registry.js";
import {
    getCriticalAssets,
    getLazyAssets
} from "./page-assets.js";

class SayBonAssetManager {

    constructor(){

        this.loading = false;

        this.queue = [];

        this.completed = 0;

        this.total = 0;

        this.listeners = new Map();

    }

    /* =======================================================
       EVENTS
    ======================================================= */

    on(eventName, callback){

        if(!this.listeners.has(eventName)){

            this.listeners.set(eventName, []);

        }

        this.listeners.get(eventName).push(callback);

    }

    emit(eventName, payload){

        const callbacks = this.listeners.get(eventName);

        if(!callbacks) return;

        callbacks.forEach(cb=>{

            try{

                cb(payload);

            }
            catch(e){

                if(AssetConfig.debug){

                    console.error(e);

                }

            }

        });

    }

    /* =======================================================
       PAGE LOADING
    ======================================================= */

    async loadPage(pageName){

        const critical = getCriticalAssets(pageName);

        const lazy = getLazyAssets(pageName);

        this.total = critical.length;

        this.completed = 0;

        this.loading = true;

        this.emit("loadstart",{

            page:pageName,

            critical,

            lazy

        });

        return {

            page:pageName,

            critical,

            lazy

        };

    }

    /* =======================================================
       QUEUE
    ======================================================= */

    enqueue(asset){

        this.queue.push(asset);

    }

    dequeue(){

        return this.queue.shift();

    }

    clearQueue(){

        this.queue.length = 0;

    }

    getQueueLength(){

        return this.queue.length;

    }

    /* =======================================================
       CACHE HELPERS
    ======================================================= */

    has(asset){

        return AssetRegistry.has(asset);

    }

    get(asset){

        return AssetRegistry.get(asset);

    }

    register(asset,promise){

        return AssetRegistry.register(asset,promise);

    }

    remove(asset){

        AssetRegistry.remove(asset);

    }

    clearCache(){

        AssetRegistry.clear();

    }

    /* =======================================================
       PROGRESS
    ======================================================= */

    progress(){

        return {

            completed:this.completed,

            total:this.total,

            percentage:
                this.total===0
                ? 0
                : Math.round(
                    (this.completed/this.total)*100
                )

        };

    }

    /* =======================================================
       PLACEHOLDERS
       Implemented in later phases
    ======================================================= */

    async preload(){

        throw new Error(
            "Phase C2 required."
        );

    }

    async preloadLazy(){

        throw new Error(
            "Phase C3 required."
        );

    }

    async prefetch(){

        throw new Error(
            "Phase C3 required."
        );

    }

    async decode(){

        throw new Error(
            "Phase C2 required."
        );

    }

}

const AssetManager =
    new SayBonAssetManager();

export default AssetManager;
