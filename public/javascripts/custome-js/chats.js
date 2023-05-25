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
    "timeOut": "1000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
socket.on('newMessage', function (data) {
    let id = $('#chatMessage').data('id')
    if (data.senderId == id) {
        $('#chatMessage').append(`
        <div class="bg-green mt-2 p-2" style="border-radius:15px;max-width:500px;clear:both;float:left">${data.chatMessage}
        <div style="float:right;margin:10px 0px 0px 10px">${moment(data.createdOn).format('h:mm')}</div>
        </div>`)
    }
    if (data.senderId != id) {
        if (!$(`.active-${data.senderId}`).next('.unSeenMessageCount').html()) {
            $(`.active-${data.senderId}`).next('.unSeenMessageCount').addClass('badge bg-primary').html(1)
        }
        else {
            $(`.active-${data.senderId}`).next('.unSeenMessageCount').html(Number($(`.active-${data.senderId}`).next('.unSeenMessageCount').html()) + 1)
        }
    }
});

$(document).off('click', '#chat').on('click', '#chat', function () {
    $this = $(this)
    $.ajax({
        type: "get",
        url: `/users/chat-model`,
        success: function (allUsers) {
            let htmlData = ``;
            for (let i = 0; i < allUsers.length; i++) {
                htmlData += `
                <div class="card mb-2 clickToChat" style="height:60px;width:285px;" id="${allUsers[i]._id}" data-login-user-id=${allUsers[0].loginUserId}>
                  <div class="row row-0">
                    <div class="col-2">
                      <img class="profilePhoto" src="/images/users/${allUsers[i].profilePath}" style="height:50px;border-radius:25px;width:50px;margin:4px 0px 3px 3px">
                    </div>
                    <div class="col">
                      <div class="card-body d-flex" style="padding-left:12px">
                        <div class="col-8 card-title name active-${allUsers[i]._id}">${allUsers[i].firstName} ${allUsers[i].lastName}</div>
                        ${allUsers[i].chatCount == 0 ? `<div class="unSeenMessageCount" style="padding:5px;margin-left:40px;width:25px;height:25px;border-radius:30px"></div>` : `
                        <div class="badge bg-primary unSeenMessageCount" style="padding:5px;margin-left:40px;width:25px;height:25px;border-radius:30px">${allUsers[i].chatCount}`}</div>
                      </div>
                    </div>
                  </div>
                </div>`
            }

            let groupData = ``;
            for (let i = 0; i < allUsers.length; i++) {
                for (let j = i; j < allUsers[i].group.length; j++) {
                    groupData += `<div class="card mb-2 GroupChat" style="height:60px;width:285px;" id=${allUsers[i].group[j]._id}>
                    <div class="row row-0">
                    <div class="col-2">
                    <img class="groupProfilePhoto" src="logo.png" style="height:50px;border-radius:25px;width:50px;margin:4px 0px 3px 3px">
                    </div>
                    <div class="col">
                    <div class="card-body d-flex" style="padding-left:12px">
                    <div class="col-8 card-title groupName">${allUsers[i].group[j].groupName}</div>
                    </div>
                    </div>
                    </div>
                    </div>`
                }
            }
            
            // console.log(allUsers[i].group[j].memberId)
            // for (let k = 0; k < allUsers[i].group[j].memberId.length; k++) {
            //     var userIdsOfGroupMembers = allUsers[i].group[j].memberId[k]
            // }
            $('.allUsers').html(htmlData);
            $('.allUsers').append(groupData);
            $('#modal-chat').modal('toggle');
            let userId = $('#chatMessage').data('id');
            $('#chatMessage').parents('.chatDiv').siblings('.userListDiv').find(`.active-${userId}`).next('.unSeenMessageCount').removeClass('badge bg-primary').html('');
        },
        error: function (data) {
            alert("Error from get #chats")
        }
    })
})

//Group Chat
$(document).off('click', '.GroupChat').on('click', '.GroupChat', function () {
    $groupName = $(this).find('.groupName').html()
    let groupId = $(this).attr('id')
    console.log(groupId);
    $GroupProfilePhoto = $(this).find('.groupProfilePhoto').attr('src')
    $.ajax({
        type: "get",
        url: `/users/Groupchat/${groupId}`,
        success: function (data) {
            $('.userProfilePhoto').html(`
            <img src='${$GroupProfilePhoto}' alt="GroupProfilePhoto" style="border-radius:250px; width:50px; height:50px">
            <span class="card-title mt-2 ms-2">${$groupName}</span>
            `)

            $('.messageDiv').html(`
            <div id="chatMessage" class="overflow-auto mt-2" style="max-height: 445px;">
            </div>
            <div class="mb-3 row">
            <div class="col-sm-11">
                 <input type="text" class="position-absolute bottom-0 mb-2 form-control text-red" id="inputMessage" placeholder="Type message..." style="width:1380px; border:none;border-radius:10px; box-shadow:10px 5px 5px grey">
                    <a href="javascript:void(0)" id="groupMessageSendBtn" data-receiver-id= data-login-user="" class="btn btn-primary me-3 rounded-pill position-absolute bottom-0 end-0 mb-2 px-4" >
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-send ms-1" width="24"
                        height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M10 14l11 -11"></path>
                        <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5">
                        </path>
                        </svg>
                    </a>
            </div>
            </div>`)
        },
        error: function (data) {
            alert("Error from .GroupChat")
        }
    })
})

$(document).off('click', '.clickToChat').on('click', '.clickToChat', function () {
    $unSeenMessageCount = $(this).find('.unSeenMessageCount')
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
                    <div class="bg-primary mt-2 p-3 mb-2" style="border-radius:15px;max-width:500px;clear:both;float:right">${chatUserDetails[i].chatMessage}
                        <div style="float:right;margin:10px 0px 0px 10px">${moment(chatUserDetails[i].createdOn).format('h:mm')}</div>
                    </div>`
                }
                if (chatUserDetails[i].receiverId == $loginUserId) {
                    messageData += `
                    <div class="bg-green mt-2 p-3 mb-2" style="border-radius:15px;max-width:500px;clear:both;float:left">${chatUserDetails[i].chatMessage}
                        <div style="float:right;margin:10px 0px 0px 10px">${moment(chatUserDetails[i].createdOn).format('h:mm')}</div>
                    </div>`
                }
            }
            $('.messageDiv').html(`
            <div id="chatMessage" class="overflow-auto mt-2" style="max-height: 445px;" data-id='${$receiverUserId}'>
            </div>
            <div class="mb-3 row">
            <div class="col-sm-11">
                 <input type="text" class="position-absolute bottom-0 mb-2 form-control text-red" id="inputMessage" placeholder="Type message..." style="width:1380px; border:none;border-radius:10px; box-shadow:10px 5px 5px grey">
                    <a href="javascript:void(0)" id="messageSendBtn" data-receiver-id=${$receiverUserId} data-login-user="${$loginUserId}" class="btn btn-primary me-3 rounded-pill position-absolute bottom-0 end-0 mb-2 px-4" >
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-send ms-1" width="24"
                        height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M10 14l11 -11"></path>
                        <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5">
                        </path>
                        </svg>
                    </a>
            </div>
            </div>`)
            $('#chatMessage').append(messageData)
            $unSeenMessageCount.removeClass('badge bg-primary')
            $unSeenMessageCount.html('')
            let height = document.querySelector('#chatMessage')
            height.scrollTop = height.scrollHeight - height.clientHeight
        },
        error: function (data) {
            alert("Error from .clickToChat")
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
                $('#chatMessage').append(`
                        <div class="bg-primary mt-2 p-3 mb-2" style ="border-radius:15px;max-width:500px;clear:both;float:right">${message.chatMessage}
                            <div style="float:right;margin:10px 0px 0px 10px">${moment(message.createdOn).format('h:mm')}</div></div>`)
                $('#inputMessage').val('')
            },
            error: function (data) {
                alert("Error from #messageSendBtn")
            }
        })
    }
})

$(document).off('click', '.modal-group').on('click', '.modal-group', function () {
    $.ajax({
        type: "get",
        url: `/users/getUsers`,
        success: function (getUsersForCreateGroup) {
            let htmlData = ``;
            for (let i = 0; i < getUsersForCreateGroup.length; i++) {
                htmlData += `
                <div class="card mb-2 w-100" style="height:60px;" id="${getUsersForCreateGroup[i]._id}" data-login-user-id=${getUsersForCreateGroup[0].loginUserId}>
                  <div class="row row-0">
                    <div class="col-2">
                      <img class="profilePhoto" src="/images/users/${getUsersForCreateGroup[i].profilePath}" style="height:50px;border-radius:25px;width:50px;margin:4px 0px 3px 3px">
                    </div>
                    <div class="col">
                      <div class="card-body d-flex" style="padding-left:12px">
                        <div class="col-8 card-title">${getUsersForCreateGroup[i].firstName} ${getUsersForCreateGroup[i].lastName}</div>
                        <div class="checkbox" style="padding:5px;width:25px;height:25px;border-radius:30px"><input type="checkbox" name="checkedUserIds" value=${getUsersForCreateGroup[i]._id} style="margin-left:150px;"></div>
                      </div>
                    </div>
                  </div>
                </div>`
            }


            $('.createGroupUsers').html(htmlData);
        },
        error: function (data) {
            alert("Error from Group Chat Model")
        }
    })
})

$(document).off('click', '#createGroupBtn').on('click', '#createGroupBtn', function () {
    let groupName = $('#groupName').val()
    groupName.trim()

    let userIds = []
    $("input:checkbox[name=checkedUserIds]:checked").each(function () {
        userIds.push($(this).val());
    });

    if (groupName.length) {
        $.ajax({
            type: "post",
            url: `/users/createGroup`,
            data: {
                "userIds": JSON.stringify(userIds),
                "groupName": groupName
            },
            success: function (data) {
                // console.log(data);
                // $('.allUsers').append(data)
                toastr.success(`Group created!`);
            },
            error: function (data) {
                alert("Error from #createGroupBtn")
            }
        })
    }
})

