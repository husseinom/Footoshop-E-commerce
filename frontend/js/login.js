const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});
function onSubmit(){
    
    let username = document.getElementById("sign-in-username").value;
    let password = document.getElementById("sign-in-password").value;
    
    

    console.log("Username:", username);
    console.log("Password:", password);
    
        const response =  fetch("http://localhost:3000/login", {
            method: 'POST',
            mode:'cors',
            headers:{'Content-Type':'application/json'},
            credentials:'include',
            body: JSON.stringify({username, password})
        }).then(response =>{
            if (response.ok){
                console.log("logged in Successully");
                
                return response.json();
                
                
            }
            else{
                throw new Error("wrong Username or password");
            }
        }).then(data =>{
            console.log(data);
            console.log(data.token)
            if (data.token) {
                localStorage.setItem("auth_token", data.token); // Store token
                
            } else {
                alert("Login failed");
            }
        }).catch((err) => {
            alert("Erreur: " + err.message);
        });
    
}

function register(){
    
    
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let email= document.getElementById("email").value;
        let firstname= document.getElementById("firstname").value;
        let lastname= document.getElementById("lastname").value;
        let address= document.getElementById("address").value;
        let phone= document.getElementById("phone").value;
        
        
    
        console.log("Username:", username);
        console.log("Password:", password);
        console.log("Email:",email);
        console.log("Firstname:",firstname);
        console.log("Lastname:",lastname);
        console.log("Address:",address);
        console.log("Phone:",phone);
        
            const response =  fetch("http://localhost:3000/register", {
                method: 'POST',
                mode:'cors',
                headers:{'Content-Type':'application/json'},
                credentials:'include',
                body: JSON.stringify({username, password,email, firstname,lastname,address,phone})
            }).then(response =>{
                if (response.ok){
                    console.log("registered SUccessfully");
                    
                    
                    return response.json();
                    
                    
                }
                else{
                    throw new Error("Utilisateur existe dejà !");
                }
            }).then(data =>{
                console.log(data);
                alert("Registered");

            }).catch((err) => {
                alert("Erreur: " + err.message);
            });
}