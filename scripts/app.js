// test data
// const marmiteDataFormatted = [
//   {
//     values: [
//       {
//         label: 'Love it',
//         value: 20,
//       },
//       {
//         label: 'Hate it',
//         value: 30,
//       },
//     ],
//   },
// ];
document.addEventListener("DOMContentLoaded", () => {
  const bigQuestions = {};
  let loveOrHate = [];

  function formatData(data) {
    if (!data)
      throw new Error(`No data provided to formatData. Received ${data}`);
    const { love, hate } = data;
    return [
      {
        values: [
          {
            label: "Love",
            value: love,
          },
          {
            label: "Hate",
            value: hate,
          },
        ],
      },
    ];
  }

  // create graph
  function drawGraph(data, mountNodeSelector = "#marmite-chart svg") {
    console.log("bar chart data ", data);

    nv.addGraph(function () {
      var chart = nv.models
        .multiBarHorizontalChart()
        .x(function (d) {
          return d.label;
        })
        .y(function (d) {
          return d.value;
        })
        .margin({ top: -5, right: 65, bottom: -10, left: 60 })
        .showValues(true) //Show bar value next to each bar.
        // .tooltips(true) //Show tooltips on hover.
        //.transitionDuration(350)
        .showControls(false);
      chart.yAxis.tickFormat(d3.format("0f"));

      d3.select(mountNodeSelector).datum(data).call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  }

  // Init firebase
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBcCX1M0n5ax2i51D9nMb9It_WtUS-04Vk",
    authDomain: "marmite-poll.firebaseapp.com",
    projectId: "marmite-poll",
    storageBucket: "marmite-poll.appspot.com",
    messagingSenderId: "695220375431",
    appId: "1:695220375431:web:8130214f0dcfccde190d22",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const db = firebase.firestore();
  const marmiteCollectionRef = db.collection("big-questions");
  // console.log("from firebase:", marmiteCollectionRef);

  // Initial get
  marmiteCollectionRef.get().then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const { id } = childSnapshot;
      loveOrHate.push(id);
      const { value } = childSnapshot.data();
      console.log("value", value);
      bigQuestions[id] = value;
    });
  });

  console.log("big questions data:", bigQuestions);
  console.log("love or hate data:", loveOrHate);

  marmiteCollectionRef.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(function (change) {
      console.log("change", change);
      if (change.type === "added") {
        console.log("New tutorial: ", change.doc.data());
      }
      if (change.type === "modified") {
        console.log("Modified tutorial: ", change.doc.data());
      }
      if (change.type === "removed") {
        console.log("Removed tutorial: ", change.doc.data());
      }
      bigQuestions[change.doc.id] = change.doc.data().value;
    });

    drawGraph(formatData(bigQuestions));
  });

  async function incrementField(field) {
    if (typeof field !== "string" || !loveOrHate.includes(field))
      throw new Error(
        `Received ${field} for a choice. Expected one of: ${loveOrHate.join()}`,
      );

    try {
      await marmiteCollectionRef.doc(field).update({
        value: bigQuestions[field] + 1,
      });
      console.log("Document successfully updated!");
    } catch (error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    }
  }

  // EventListeners
  const loveItButton = document.getElementById("love-it");
  const hateItButton = document.getElementById("hate-it");

  loveItButton.addEventListener("click", () => {
    console.log("added to love");
    incrementField("love");
  });

  hateItButton.addEventListener("click", () => {
    console.log("added to hate");
    incrementField("hate");
  });
});
