$(document).ready(function () {

    var valueOfPassword = $("#password").val();

    $.validator.addMethod("checklower", function (valueOfPassword) {
        return /[a-z]/.test(valueOfPassword);
    });
    $.validator.addMethod("checkupper", function (valueOfPassword) {
        return /[A-Z]/.test(valueOfPassword);
    });
    $.validator.addMethod("checkdigit", function (valueOfPassword) {
        return /[0-9]/.test(valueOfPassword);
    });
    $.validator.addMethod("checkSpeicalChar", function (valueOfPassword) {
        let val = /(?=.*[!@#$%^&*])/.test(valueOfPassword);
        console.log("val",val);
        console.log("valueOfPassword",valueOfPassword);
        return val
    });

    $('#signup').validate({
        rules: {
            firstName: {
                required: true
            },
            lastName: {
                required: true
            },
            email: {
                required: true,
                email: true,
                remote: "/check-email"
            },
            gender: {
                required: true,
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 30,
                checklower: true,
                checkupper: true,
                checkdigit: true,
                checkSpeicalChar : true
            },
            confrimPassword: {
                required: true,
                equalTo: "#password"
            }
        },
        messages: {
            firstName: {
                required: "Please enter First name"
            },
            lastName: {
                required: "Please enter Last name"
            },
            email: {
                required: "Please enter Email",
                remote: "Email Already Exists"
            },
            gender: {
                required: "Please Select your Gender"
            },
            password: { 
                required: "Please Enter password",
                checklower: "Need atleast 1 lowercase alphabet",
                checkupper: "Need atleast 1 uppercase alphabet",
                checkdigit: "Need atleast 1 digit",
                checkSpeicalChar : "Need atleast 1 Speical Charcater"
            }, 
            confrimPassword: {
                required: "Please Enter confrim password",
                equalTo: "Password Not match"
            }
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element.closest('div'));
        },
        submitHandler: function (form) {
            form.submit();
        }
    })
});


