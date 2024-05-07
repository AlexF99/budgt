import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Route } from "../router";
import { Button } from "@chakra-ui/react";

type LoginProps = {
    onClose: () => void;
}

const Login = ({ onClose }: LoginProps) => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const navigate = useNavigate();

    const googleSignin = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                // const credential = GoogleAuthProvider.credentialFromResult(result);
                // const token = credential?.accessToken;
                // The signed-in user info.
                navigate(Route.HOME, { replace: true });
                onClose()
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // // The email of the user's account used.
                // const email = error.customData.email;
                // // The AuthCredential type that was used.
                // const credential = GoogleAuthProvider.credentialFromError(error);
                console.log(errorCode, errorMessage)

            });
    }

    return (
        <Button type="button" onClick={() => googleSignin()}>Sign-in with Google</Button>
    )

};

export default Login;