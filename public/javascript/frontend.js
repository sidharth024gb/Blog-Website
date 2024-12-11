//Toggle in Write Page:
$("#write-blog").on("click", () => {
  $("#blog-list").css(
    "display",
    $("#blog-list").css("display") === "flex" ? "none" : "flex"
  );
  $("#write-form").css(
    "display",
    $("#write-form").css("display") === "block" ? "none" : "block"
  );
});

//Delete a blog
function deleteBlog(id) {
  fetch("/delete/blog", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }

      return res.json().then((error) => {
        throw new Error(error.message || "Failed to delete the blog.");
      });
    })
    .then((data) => {
      alert(data.message || "Blog Deleted Successfully");
      location.reload();
    })
    .catch((err) => {
      console.log(err);
      alert(err.message || "Error occured while deleting the blog.");
    });
}

//Preview Image
$("form #image").on("change", function () {
  if (this.files.length !== 0) {
    $("form label>img").attr("src", URL.createObjectURL(this.files[0]));
  }
});
