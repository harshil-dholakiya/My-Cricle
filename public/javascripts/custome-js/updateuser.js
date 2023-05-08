$(document).ready(function () {

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    $('#updateUserForm').validate({
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
                required: "Please Select Gender"
            }
        },
        submitHandler: function (form) {
            var form = $('form')[0];
            const formData = new FormData(form);
            formData.append('userProfile', $('input[type=file]')[0].files[0]);
            $.ajax({
                url: '/users/updateUser',
                type: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    console.log(data);
                    if (data.type == "success") {
                        toastr.success('Update Successfully!!');
                        // location.href = "/"
                    }
                },
                error: function () {
                    alert('Please Enter Valid Image');
                }
            })

        }
    })
});


