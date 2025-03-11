const generateMessage = (entity) => {
    return {
        notFound: `${entity} Not Found`,
        alreadyExist: `${entity} Already Exist`,
        createdSuccessfully: `${entity}Created Successfully`,
        updatedSuccessfully: `${entity}Updated Successfully`,
        deletedSuccessfully: `${entity}Deleted  Successfully`,
        failToCreate: `Fail To Create ${entity}`,
        failToUpdate: `Fail To Update ${entity}`,
        failToDelete: `Fail To Delete ${entity}`
    }
}
export const messageSystem =
{
    user: {
        ...generateMessage("User"),
        incorrectPassword: "Incorrect Password ",
        emailActive: "Email Created but Ative Your Email From Message Gmail First",
        emailIsActived: "Email is active you con login now",
        invalid: "Invalid User",
        login: "Login Successfully",
        yourProfile: "Your Profile",
        token: "Invalid Token",
        resetCode: "Sended Your Code In Gmail Message",
        expiredCode: "Invalid or expired reset token",
        notAuthorized: "Not Authorized",
        authorization: "Authorization Is Required",
        isAlreadyDeleted : "User Is Already Deleted",
        freezeAcc : "User Is Freezed In 60 Days Login To Return The Account "
    },
    errors: {
        email: {
            invalid: "The email address you entered is not valid.",
            taken: "An account with this email address already exists.",
        },
        password: {
            weak: "Your password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.",
            mismatch: "The passwords do not match.",
        },
        required: "This field is required.",
        username: {
            taken: "This username is already taken. Please choose another one.",
        },
        date: {
            invalid: "The date you entered is invalid. Please use the format DD/MM/YYYY.",
        },
        phone : {
            invalid : "Please enter a valid phone number."
        },
        length: {
            tooShort: (min) => `The input is too short. It must be at least ${min} characters long.`,
            tooLong: (max) => `The input is too long. It cannot exceed ${max} characters.`,
        },
    }
}