import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import BasicCard from "../../components/Card";
import RadioCard from "../../components/RadioCard";
import BoGCard from "../../components/BoGCard";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import styles from "../../styles/Developer.module.css";
import { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { sections, listTypes } from "../../lib/bootie_constants";
import countApplicantCheckboxes from "../../utility/countApplicantChecks";
import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  width: "50%",
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary,
  },
}));

const Application: NextPage = () => {
  const router = useRouter();

  if (
    typeof window !== "undefined" &&
    localStorage.getItem("submitted") !== null
  ) {
    router.replace("/success");
  }

  const [currSection, setCurrSection] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submitFailed, setSubmitFailed] = React.useState(false);

  const buildData = () => {
    const data: any = {};
    sections.forEach((section) => {
      section.forEach((item) => {
        data[item.id] =
          localStorage.getItem(item.id) !== undefined &&
            localStorage.getItem(item.id) !== null
            ? localStorage.getItem(item.id)
            : "N/A";
      });
    });
    return data;
  };

  return (
    <main className={styles.main}>
      <Head>
        <title>Bootie App</title>
        <meta
          name="description"
          content="Application for Bits of Good Engineering"
        />
        <link rel="icon" href="https://bitsofgood.org/favicon.png" />
      </Head>
      <BoGCard />
      <br />
      <Box
        component="form"
        autoComplete="off"
        onSubmit={(evt: any) => {
          var complete = true;
          sections[currSection].forEach((item) => {
            evt.preventDefault();
            if (
              item.required &&
              evt.target[item.id]?.value === "" &&
              item.type === undefined
            ) {
              document.getElementById(item.id)?.focus();
              document.getElementById(item.id)?.blur();
              complete = false;
            } else if (
              item.required &&
              evt.target[item.id]?.value === "" &&
              item.type === listTypes.RADIO
            ) {
              setOpen(true);
              document.getElementById(item.id)?.click();
              complete = false;
            }
          });
          if (complete) {
            if (currSection < sections.length - 1) {
              setCurrSection(currSection + 1);
              window.scroll(0, 0);
            } else {
              setSubmitted(true);
              const data = buildData();
              fetch("/api/submit_bootie_info", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              }).then((response) => {
                if (!response.ok) {
                  setSubmitted(false);
                  setSubmitFailed(true);
                } else {
                  localStorage.clear();
                  localStorage.setItem("submitted", "true");
                  localStorage.setItem("applicationCycle", process.env.NEXT_PUBLIC_APPLICATION_CYCLE ?? "")
                  router.push("/success");
                  setSubmitted(false);
                }
              });
            }
          }
        }}
      >
        {sections[currSection]?.map((item) => {
          if (item.type === undefined) {
            return (
              <>
                <BasicCard
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  required={item.required}
                  wordLimit={item.wordLimit}
                />
                <br />
              </>
            );
          } else if (item.type === listTypes.RADIO) {
            return (
              <>
                <RadioCard
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  required={item.required}
                  radioOptions={item.radioOptions}
                  hasOther={item.hasOther}
                />
                <br />
              </>
            );
          }
        })}
        <div className={styles.controls}>
          <div className={styles.g1}>
            <Button
              variant="outlined"
              onClick={() => {
                if (currSection > 0) {
                  setCurrSection(currSection - 1);
                  window.scroll(0, 0);
                } else {
                  history.back();
                }
              }}
            >
              Back
            </Button>
            &nbsp;&nbsp;
            <Button type="submit" variant="outlined">
              {currSection !== sections.length - 1 ? "Next" : "Submit"}
            </Button>
          </div>
          <div className={styles.progressContainer}>
            <BorderLinearProgress
              variant="determinate"
              value={((currSection + 1) / sections.length) * 100}
            />
            <span>
              Page {currSection + 1} of {sections.length}
            </span>
          </div>
          <Button
            variant="text"
            onClick={() => {
              localStorage.clear();
              router.reload();
            }}
          >
            Clear Form
          </Button>
        </div>
      </Box>
      <div>
        <Snackbar open={open} onClose={() => setOpen(false)}>
          <Alert severity="error">Please fill out all required fields</Alert>
        </Snackbar>
      </div>
      <div>
        <Snackbar open={submitFailed} onClose={() => setSubmitFailed(false)}>
          <Alert severity="error">Application failed to submit</Alert>
        </Snackbar>
      </div>
      <Modal
        open={submitted}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Please wait while we process your application...
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Did you know that it&apos;s illegal to own just one guinea pig in
            Switzerland. &#128022; It&apos;s considered animal abuse because
            they&apos;re social beings and get lonely. &#129402;
          </Typography>
        </Box>
      </Modal>
    </main>
  );
};

export default Application;

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
