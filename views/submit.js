// Client side unique ID - This could and probably should move to server with UUID
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
}
  


document.getElementById('submitButton').addEventListener("click", () => {
    
    //generates random string to append to filename
    let postid = uuidv4();

    //assigns inputed file/s to variable inputElem
    let inputElem = document.getElementById("imgFile");

    //assigns the first submitted file from array inputElem 
    let file = inputElem.files[0];

    /* no more blobbing no need for this 

        //slices image into a useable array blobl blobl bloblb
        let blob = file.slice(0, file.size, "image/jpeg");

    */

    //SIKE we just remake file but new name no blob
    //thanks github: https://stackoverflow.com/questions/51782270/change-name-of-uploaded-file-on-client
    newFile = new File([file], `${postid}_post.jpeg`, { type: "image/jpeg" });

    //creates new FormData object 
    let formData = new FormData();

    //appends the renamed file to the formData object
    //possible efficiency upgrade here? 3rd optional param for filename:
    //https://developer.mozilla.org/en-US/docs/Web/API/FormData/append
    formData.append('imageFile', newFile);

    //invokes a fetch function to POST the formData to /upload dir
    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    fetch('/upload', {
        method: "POST",
        body: formData,
    })
        .then(res => res.text())
        .then(loadPosts());
});


function loadPosts(){
  fetch('/upload')
  .then(res => res.json())
  .then((x) => {
    for(y = 0; y < x[0].length; y++){
      const newimg = document.createElement('img');
      newimg.setAttribute(
        'src',
        'https://storage.googleapis.com/lost-found-storage/' + x[0][y].id
      );
      newimg.setAttribute["height", 50];
      newimg.setAttribute["width", 50]
      document.getElementById('images').appendChild(newimg);
    }
  });
}