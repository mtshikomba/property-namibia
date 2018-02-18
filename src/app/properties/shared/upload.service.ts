import { Injectable } from '@angular/core';
import {AngularFireObject} from "angularfire2/database";
import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database-deprecated";
import {Upload} from "./upload";
import * as firebase from "firebase";
import {reject} from "q";


@Injectable()
export class UploadService {

    private basePath: string = '/uploads';
    uploads: Upload[] = [];
    thumbnail: Upload;

    constructor(private db: AngularFireDatabase) {}


    pushUpload(upload: Upload): Promise<Upload> {
        let storageRef = firebase.storage().ref();
        // let uploadTask = storageRef.child(this.basePath+"/"+upload.file.name).put(upload.file);
        let uploadTask = storageRef.child(`${this.basePath}/${upload.file.name}`).put(upload.file);
        return new Promise((resolve, reject) => {
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                (snapshot) =>  {
                    // upload in progress
                    upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100
                },
                (error) => {
                    // upload failed
                    console.log(error);
                    return reject(error);
                },
                () => {
                    // upload success
                    upload.url = uploadTask.snapshot.downloadURL;
                    upload.name = upload.file.name;
                    // this.saveFileData(upload);
                    return resolve(upload);
                }
            );
        });
    }

    // Writes the file details to the realtime db
    // private saveFileData(upload: Upload): any {
    //     // this.db.list(`${this.basePath}/`).push(upload);
    //     return this.db.list(this.basePath+"/").push(upload);
    // }

    deleteUpload(upload: Upload) {
        this.deleteFileData(upload.$key)
            .then( () => {
                this.deleteFileStorage(upload.name);
            })
            .catch(error => console.log(error));
    }

    // Deletes the file details from the realtime db
    private deleteFileData(key: string) {
        return this.db.list(`${this.basePath}/`).remove(key);
    }

    // Firebase files must have unique names in their respective storage dir
    // So the name serves as a unique key
    private deleteFileStorage(name:string) {
        let storageRef = firebase.storage().ref();
        storageRef.child(`${this.basePath}/${name}`).delete();
    }
}
