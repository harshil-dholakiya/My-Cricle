$(document).ready(function () {
  $("#signinForm").validate({
    rules: {
      email: {
        required: true
      },
      password: {
        required: true
      }
    },
    messages: {
      email: {
        required: "Please Enter valid email"
      },
      password: {
        required: "Please Enter valid Password"
      },
    },
    errorPlacement: function (error, element) {
      error.insertAfter(element.closest('div'));
    },
    submitHandler: function (form) {
      form.submit();
    }
  })
})