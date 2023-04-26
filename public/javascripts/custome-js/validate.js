$(document).ready(function () {
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
                required: "Please Enter password"
            },
            confrimPassword: {
                required: "Please Enter confrim password",
                equalTo: "Password Not match"
            }
        },
        errorPlacement: function (error, element) {
            error.insertAfter( element.closest('div'));
        },
        submitHandler: function (form) {
            form.submit();
        }
    })
});


