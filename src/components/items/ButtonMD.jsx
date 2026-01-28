import { Button } from "@mui/material";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import "./ButtonMD.css";

function ButtonMD({ type, disabled, title, variant, onClickTerm, startIcon, fontSize, borderColor, backgroundColor, borderRadius, width }) {
    const { t } = useTranslation();

    const [screenWidth, setScreenWidth] = useState('')
    // const colors = tokens(theme.palette.mode);
    let navigate = useNavigate();
    const color = "rgb(150, 143, 143)"
    const override = {
        display: ' block',
        margin: '0 auto',
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.innerWidth < 400) {
                setScreenWidth(true)
            } else {
                setScreenWidth(false)

            }
        }, 1000);

        return () => clearInterval(interval);

    }, []);
    return (
        <>

            {screenWidth ?
                <>
                    {variant == "outlined" ?
                        <>
                            {disabled ? <>
                                <Button mb="30px"
                                    variant={variant}
                                    type={type}
                                    disabled={disabled}
                                    startIcon={<ClipLoader color={color} loading={disabled} css={override} size={15} />}
                                    onClick={onClickTerm}
                                    style={{
                                        padding: "15px 30px",
                                        borderColor: { borderColor },
                                        width: width,
                                        height: "45px", boxShadow: "none", borderRadius: { borderRadius },
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 400,
                                        lineHeight: "24px"

                                    }} >
                                    {t(title)}
                                </Button>
                            </> : <>
                                <Button mb="30px"
                                    variant={variant}
                                    disabled={disabled}
                                    type={type}
                                    startIcon={startIcon}
                                    onClick={onClickTerm}
                                    style={{
                                        fontWeight: 300,
                                        fontSize: "12px",
                                        padding: "15px",
                                        borderColor: { borderColor },
                                        width: width,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 400,
                                        lineHeight: "24px"

                                    }} >{t(title)}</Button>
                            </>
                            }
                        </>
                        :
                        variant == "contained" ?
                            <>
                                {disabled ? <>
                                    <Button mb="30px"
                                        variant={variant}
                                        type={type}
                                        disabled={disabled}
                                        startIcon={<ClipLoader color={color} loading={disabled} css={override} size={15} />}
                                        onClick={onClickTerm}
                                        className="btn1"
                                        style={{
                                            backgroundColor: "#006EC2",
                                            fontWeight: 300,
                                            fontSize: "12px",
                                            borderRadius: borderRadius,
                                            width: width,
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 400,
                                            lineHeight: "24px"

                                        }} >
                                        {t(title)}
                                    </Button>
                                </> : <>
                                    <Button mb="30px"
                                        variant={variant}
                                        disabled={disabled}
                                        type={type}
                                        startIcon={startIcon}
                                        onClick={onClickTerm}
                                        className="btn"
                                        style={{
                                            backgroundColor: "#006EC2",
                                            fontWeight: 300,
                                            fontSize: "12px",
                                            borderRadius: borderRadius,
                                            width: width,
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 400,
                                            lineHeight: "24px"

                                        }} >{t(title)}</Button>
                                </>
                                }
                            </>
                            :
                            <>
                                {disabled ? <>
                                    <Button mb="30px"
                                        variant={variant}
                                        type={type}
                                        disabled={disabled}
                                        startIcon={<ClipLoader color={color} loading={disabled} css={override} size={15} />}
                                        onClick={onClickTerm}
                                        style={{
                                            width: width
                                        }} >
                                        {t(title)}
                                    </Button>
                                </> : <>
                                    <Button mb="30px"
                                        variant={variant}
                                        disabled={disabled}
                                        type={type}
                                        startIcon={startIcon}
                                        onClick={onClickTerm}

                                        style={{
                                            width: width
                                        }} >{t(title)}</Button>
                                </>
                                }
                            </>
                    }
                </>
                :
                <>
                    {/* Large Screen  */}
                    {variant == "outlined" ?
                        <>
                            {disabled ? <>
                                <Button mb="30px"
                                    variant={variant}
                                    type={type}
                                    disabled={disabled}
                                    startIcon={<ClipLoader color={color} loading={disabled} css={override} size={15} />}
                                    onClick={onClickTerm}

                                    style={{
                                        padding: "15px",
                                        borderColor: { borderColor },
                                        width: width,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 400,
                                        lineHeight: "24px"

                                    }} >
                                    {t(title)}
                                </Button>
                            </> : <>
                                <Button mb="30px"
                                    variant={variant}
                                    disabled={disabled}
                                    type={type}
                                    startIcon={startIcon}
                                    onClick={onClickTerm}
                                    // className="btn"
                                    style={{
                                        // padding: "10px 10px",
                                        border: "1px solid #006EC2",
                                        color: "#000000",
                                        textTransform: "capitalize",
                                        fontFamily: "Roboto",
                                        width: width,
                                        fontWeight: 300,
                                        fontSize: "15px",
                                        // borderRadius: borderRadius,
                                        height: "35px", boxShadow: "none", borderRadius: "5px",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 400,
                                        lineHeight: "24px"

                                    }} >{t(title)}</Button>
                            </>
                            }
                        </>
                        :
                        variant == "contained" ?
                            <>
                                {disabled ? <>
                                    <Button mb="30px"
                                        variant={variant}
                                        type={type}
                                        disabled={disabled}
                                        startIcon={<ClipLoader color={color} loading={disabled} css={override} size={15} />}
                                        onClick={onClickTerm}
                                        className="btn1"
                                        style={{
                                            backgroundColor: "#006EC2",
                                            fontWeight: 300,
                                            fontSize: "12px",
                                            borderRadius: borderRadius,
                                            fontFamily: "Roboto",
                                            width: width, boxShadow: "none",
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 400,
                                            lineHeight: "24px"

                                        }} >
                                        {t(title)}
                                    </Button>
                                </> : <>
                                    <Button mb="30px"
                                        variant={variant}
                                        disabled={disabled}
                                        type={type}
                                        startIcon={startIcon}
                                        onClick={onClickTerm}
                                        className="btn"

                                        style={{
                                            backgroundColor: "#006EC2",
                                            fontWeight: 300,
                                            fontSize: "12px",
                                            borderRadius: borderRadius,
                                            fontFamily: "Roboto",
                                            width: width, boxShadow: "none",
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 400,
                                            lineHeight: "24px"
                                        }} >{t(title)}</Button>
                                </>
                                }
                            </>
                            :
                            <>
                                {disabled ? <>
                                    <Button mb="30px"
                                        variant={variant}
                                        type={type}
                                        disabled={disabled}
                                        startIcon={<ClipLoader color={color} loading={disabled} css={override} size={15} />}
                                        onClick={onClickTerm}
                                        style={{
                                            width: width
                                        }} >
                                        {title}
                                    </Button>
                                </> : <>
                                    <Button mb="30px"
                                        variant={variant}
                                        disabled={disabled}
                                        type={type}
                                        startIcon={startIcon}
                                        onClick={onClickTerm}

                                        style={{
                                            width: width
                                        }} >{title}</Button>
                                </>
                                }
                            </>
                    }
                </>
            }

        </>
    )
}

export default ButtonMD;