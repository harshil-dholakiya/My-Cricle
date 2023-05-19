socket.on('newMessage', function (data) {
    let id = $('.chatMessage').attr('id')
    if (data.senderId == id) {
        $('.chatMessage').append(`
        <div class="bg-green mt-2 p-2" style="border-radius:15px;max-width:500px;clear:both;float:left">${data.chatMessage}
        <div style="float:right;margin:10px 0px 0px 10px">${moment(data.createdOn).format('h:mm')}</div>
        </div>`)
    }
});


$(document).off('click', '#chat').on('click', '#chat', function () {
    userId = $(this).data("userid")
    $this = $(this)
    $.ajax({
        type: "get",
        url: `/users/chat-model`,
        success: function (allUsers) {
            let htmlData = ``;
            for (let i = 0; i < allUsers.length; i++) {
                htmlData += `
                <div class="card mb-2 clickToChat" style="height:60px;width:285px" id="${allUsers[i]._id}" data-login-user-id=${allUsers[0].loginUserId}>
                  <div class="row row-0">
                    <div class="col-2">
                      <img class="profilePhoto" src="/images/users/${allUsers[i].profilePath}" style="height:50px;border-radius:25px;width:50px;margin:4px 0px 3px 3px">
                    </div>
                    <div class="col">
                      <div class="card-body d-flex" style="padding-left:12px">
                        <div class="col-8 card-title name">${allUsers[i].firstName} ${allUsers[i].lastName}</div>
                        <div class="badge bg-primary" style="padding:5px;margin-left:40px;width:25px;height:25px;border-radius:30px">${allUsers[i].chatCount}</div>
                      </div>
                    </div>
                  </div>
                </div>`
            }
            $('.allUsers').html(htmlData);
            $('#modal-chat').modal('toggle')
        },
        error: function (data) {
            alert("Error from get requests")
        }
    })
})

$(document).off('click', '.clickToChat').on('click', '.clickToChat', function () {
    let userId = $(this).attr("id")
    $loginUserId = $(this).data('login-user-id')
    $this = $(this)
    $receiverUserId = userId
    $userName = $(this).find('.name').html()
    $userProfilePhoto = $(this).find('.profilePhoto').attr('src')
    $.ajax({
        type: "get",
        url: `/users/chat/${userId}`,
        success: function (chatUserDetails) {
            $('.userProfilePhoto').html(`
            <img src='${$userProfilePhoto}' alt="ProfilePhoto" style="border-radius:250px; width:50px; height:50px">
            <span class="card-title mt-2 ms-2">${$userName}</span>
            `)

            let messageData = ``;
            for (let i = 0; i < chatUserDetails.length; i++) {
                if (chatUserDetails[i].receiverId == $receiverUserId) {
                    messageData += `
                    <div class="bg-primary mt-2 p-3" style="border-radius:15px;max-width:500px;clear:both;float:right">${chatUserDetails[i].chatMessage}
                        <div style="float:right;margin:10px 0px 0px 10px">${moment(chatUserDetails[i].createdOn).format('h:mm')}</div>
                    </div>`
                }
                if (chatUserDetails[i].receiverId == $loginUserId) {
                    messageData += `
                    <div class="bg-green mt-2 p-3" style="border-radius:15px;max-width:500px;clear:both;float:left">${chatUserDetails[i].chatMessage}
                        <div style="float:right;margin:10px 0px 0px 10px">${moment(chatUserDetails[i].createdOn).format('h:mm')}</div>
                    </div>`
                }
            }
            $('.messageDiv').html(`
            <div class="chatMessage overflow-auto mt-2" style="width: 100%; height: 450px;" id='${$receiverUserId}'>
            </div>
            <input type="text" id="inputMessage" placeholder="Type message..." class="shadow p-3 rounded position-absolute bottom-0 mb-2" style="width: 1430px; border:none;height:30px;border-radius:10px">
            <a href="javascript:void(0)" id="messageSendBtn" data-receiver-id=${$receiverUserId} class="btn btn-primary me-3 position-absolute bottom-0 end-0 mb-2" style="height:30px;border-radius:25px">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-send ms-1" width="24"
            height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
            stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M10 14l11 -11"></path>
            <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5">
            </path>
            </svg>
            </a>`)
            $('.chatMessage').append(messageData)
        },
        error: function (data) {
            alert("Error from chats")
        }
    })
})

$(document).off('click', '#messageSendBtn').on('click', '#messageSendBtn', function () {
    let userId = $(this).data("receiver-id")
    let chatMessageValue = $('#inputMessage').val()
    chatMessageValue.trim()
    $this = $(this)
    if (chatMessageValue.length) {
        $.ajax({
            type: "post",
            url: `/users/userChat/${userId}`,
            data: {
                "chatMessage": chatMessageValue
            },
            success: function (message) {
                $('.chatMessage').append(`
                <div class="bg-primary mt-2 p-3 mb-2" style="border-radius:15px;max-width:500px;clear:both;float:right">${message.chatMessage}
                <div style="float:right;margin:10px 0px 0px 10px">${moment(message.createdOn).format('h:mm')}</div>
                    
                </div>`)
                $('#inputMessage').val('')
            },
            error: function (data) {
                alert("Error from chats")
            }
        })
    }
})
