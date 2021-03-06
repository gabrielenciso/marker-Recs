/* exported openEntry, focusEntry */

var $markerButton = document.querySelector('.marker-button');
var $markerOverlay = document.querySelector('.marker-overlay');
var $searchInput = document.getElementById('autocomplete');

var $entryOverlay = document.querySelector('.entry-overlay');

var $selectFriend = document.querySelector('.select-friend');
var $selectFriendImg = document.querySelector('.select-friend-image img');
var $selectFriendSelect = document.querySelector('.select-friend select');
var $selectFriendSubmit = document.querySelector('#select-friend-form');
var $selectFriendAddNew = document.querySelector('.add-friend-button');

var $addFriend = document.querySelector('.add-friend');
var $addFriendImg = document.querySelector('.input-friend-image img');
var $fileFriendImg = document.querySelector('#friendImgUpload');
var $addFriendSubmit = document.querySelector('#friend-form');

var $addEntry = document.querySelector('.add-entry');
var $entryFriendName = document.querySelector('.entry-name-tags h3');
var $entryFriendImage = document.querySelector('.entry-friend-image img');
var $addEntryImg = document.querySelector('.entry-image img');
var $fileEntryImg = document.querySelector('#entryImageUpload');
var $addTagButton = document.querySelector('.add-tag-button i');
var $entryTagsList = document.querySelector('.entry-tags-list');
var $inputTag = document.querySelector('#input-tag');
var $addEntrySubmit = document.querySelector('#entry-form');

var $slideButton = document.querySelector('.show-more-entries i');
var $entriesList = document.querySelector('.entries-list');
var $recEntries = document.querySelector('#rec-entries');
var $noEntries = document.querySelector('.no-entries');

var $deleteOverlay = document.querySelector('.delete-overlay');
var $deleteYesNo = document.querySelector('.delete-options');

var $mql = window.matchMedia('(max-width: 768px)');

function handleMarkerOverlay(event) {
  data.marking = true;
  if (mobile === true) {
    $entriesList.style.height = 150 + 'px';
  }
  $markerButton.className = 'marker-button hidden';
  $markerOverlay.className = 'marker-overlay';
  $searchInput.className = 'pac-target-input hidden';
  setTimeout(function () {
    $markerOverlay.className = 'marker-overlay hidden';
  }, 2000);
}

var clickMapEvent;
var mapFromMap;
function openEntry(event, map) {
  $entryOverlay.className = 'entry-overlay';
  clickMapEvent = event;
  mapFromMap = map;
}

var friendEntry;
function handleSelectFriendSubmit(event) {
  event.preventDefault();

  // update entry pop up friend img and name
  var selectedId = event.target.elements.selectFriend.value;
  if (selectedId === '0') {
    alert('add or select a friend');
    return;
  }

  for (var i = 0; i < data.friends.length; i++) {
    var currentFriend = data.friends[i];
    if (selectedId === currentFriend.friendId.toString()) {
      $entryFriendName.textContent = currentFriend.name[0].toUpperCase() + currentFriend.name.slice(1) + '\'s Rec';
      $entryFriendImage.setAttribute('src', currentFriend.photo);
      friendEntry = currentFriend;
    }
  }

  $selectFriendImg.setAttribute('src', 'images/personsample.jpeg');
  $selectFriendSelect.value = '0';
  $selectFriend.className = 'select-friend hidden';
  $addEntry.className = 'add-entry';
}

function handleOptionChange(event) {
  var friendId = event.target.value;
  for (var i = 0; i < data.friends.length; i++) {
    var currentFriend = data.friends[i];
    if (friendId === currentFriend.friendId.toString()) {
      $selectFriendImg.setAttribute('src', currentFriend.photo);
    }
  }
}

function handleSelectAddAFriend(event) {
  $selectFriend.className = 'select-friend hidden';
  $addFriend.className = 'add-friend';
}

function handleFriendImgUpdate(event) {
  $addFriendImg.setAttribute('src', event.target.value);
}

function handleFriendSubmit(event) {
  event.preventDefault();
  var form = event.target;
  var friend = {};
  friend.photo = form.elements.friendImgUrl.value;
  if (friend.photo === '') {
    friend.photo = 'images/personsample.jpeg';
  }
  friend.name = form.elements.friend.value;
  friend.friendId = data.nextFriendId;

  data.nextFriendId++;
  data.friends.unshift(friend);
  addFriendSelectOption(friend);

  $addFriend.className = 'add-friend hidden';
  $selectFriend.className = 'select-friend';
  $addFriendImg.setAttribute('src', 'images/personsample.jpeg');

  $selectFriendImg.setAttribute('src', friend.photo);
  $selectFriendSelect.value = friend.friendId.toString();

  form.reset();
}

function addFriendSelectOption(newFriend) {
  var $newFriendOption = document.createElement('option');
  $newFriendOption.setAttribute('value', newFriend.friendId);
  $newFriendOption.textContent = newFriend.name;
  $selectFriendSelect.appendChild($newFriendOption);
}

function handleEntryImgUpdate(event) {
  $addEntryImg.setAttribute('src', event.target.value);
}

function handleEntrySubmit(event) {
  event.preventDefault();

  if (data.editing === null) {
    var rec = {};
    var form = event.target;
    rec.marker = clickMapEvent;
    rec.name = form.elements.recName.value;
    rec.image = form.elements.entryImage.value;
    if (rec.image === '') {
      rec.image = 'images/placeholder-image-square 2.jpg';
    }
    rec.notes = form.elements.notes.value;
    rec.tags = tags;
    rec.fromFriend = friendEntry;
    rec.entryId = data.nextEntryId;

    data.nextEntryId++;

    makeMarker(clickMapEvent.latLng, mapFromMap, rec.fromFriend.photo, rec.entryId);

    data.entries.unshift(rec);

    var newRec = makeEntry(rec);
    $recEntries.prepend(newRec);

    form.reset();
  } else {
    var editedRec = {};
    var editedForm = event.target;
    editedRec.name = editedForm.elements.recName.value;
    editedRec.image = editedForm.elements.entryImage.value;
    editedRec.notes = editedForm.elements.notes.value;
    editedRec.tags = tags;
    editedRec.fromFriend = data.editing.fromFriend;
    editedRec.entryId = data.editing.entryId;
    editedRec.marker = data.editing.marker;

    for (var i = 0; i < data.entries.length; i++) {
      if (data.editing.entryId === data.entries[i].entryId) {
        data.entries.splice(i, 1, editedRec);
      }
    }
    var $entriesListArray = document.querySelectorAll('li');

    for (var j = 0; j < $entriesListArray.length; j++) {
      var currentDataEntryId = $entriesListArray[j].getAttribute('data-entry-id');
      if (data.editing.entryId.toString() === currentDataEntryId) {
        var $editedEntry = makeEntry(editedRec);
        $recEntries.replaceChild($editedEntry, $entriesListArray[j]);
        break;
      }
    }
    editedForm.reset();
    data.editing = null;
  }

  $entryFriendImage.setAttribute('src', 'images/personsample.jpeg');
  $entryFriendName.textContent = 'Friend\'s Rec';
  $addEntryImg.setAttribute('src', 'images/placeholder-image-square 2.jpg');
  removeChildNodes($entryTagsList);
  $entryOverlay.className = 'entry-overlay hidden';
  $addFriend.className = 'add-friend hidden';
  $addEntry.className = 'add-entry hidden';
  $selectFriend.className = 'select-friend';
  $markerButton.className = 'marker-button';
  $noEntries.className = 'no-entries text-align-center hidden';
  $searchInput.className = 'pac-target-input';

  data.marking = false;

  tags = [];
}

var tags = [];
function handleAddTag(event) {
  var tagValue = $inputTag.value;

  if (tagValue === '') {
    return;
  }

  var tag = document.createElement('span');
  tag.textContent = tagValue;
  var deleteTag = document.createElement('i');
  deleteTag.className = 'fa-solid fa-xmark';
  deleteTag.addEventListener('click', handleDeleteTag);
  tag.appendChild(deleteTag);

  $entryTagsList.appendChild(tag);

  $inputTag.value = '';
  tags.push(tagValue);
}

function handleDeleteTag(event) {
  var tag = event.target.closest('span');
  var index = tags.indexOf(tag.textContent);
  tags.splice(index, 1);
  tag.remove();
}

function removeChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

var slide = false;
function handleSlide() {
  if (slide === false) {
    $entriesList.style.height = 500 + 'px';
    slide = true;
  } else if (slide === true) {
    $entriesList.style.height = 150 + 'px';
    slide = false;
  }
}

var mobile = false;
function handleScreenChange(event) {
  if (!event.matches) {
    $entriesList.style.height = '';
    mobile = false;
  } else {
    mobile = true;
  }
}

function makeEntry(rec) {
  /*
  <li class="rec row">
    <div class="col-two-fifth">
      <div class="rec-image">
        <img src="images/placeholder-image-square 2.jpg">
      </div>
    </div>
    <div class="rec-info col-three-fifth">
      <h2 class="font-header">Name of Place</h2>
      <div class="rec-tags-box">

      </div>
      <p class="font-body">notes asfdasfasfa</p>
      <div class="row col-full justify-align-center">
        <div class="rec-friend-img">
          <img src="images/personsample.jpeg">
        </div>
        <h3 class="font-body">Friend's Rec</h3>
      </div>
    </div>
  </li>
  */

  var recBox = document.createElement('li');
  recBox.className = 'rec row';
  recBox.setAttribute('data-entry-id', rec.entryId);
  recBox.addEventListener('click', handleEntryActions);

  ///
  var recBoxLeft = document.createElement('div');
  recBoxLeft.className = 'col-two-fifth';

  var recImgBox = document.createElement('div');
  recImgBox.className = 'rec-image';

  var recImg = document.createElement('img');
  recImg.setAttribute('src', rec.image);

  var recOptionsBox = document.createElement('div');
  recOptionsBox.className = 'options-highlight';

  var recOptions = document.createElement('i');
  recOptions.className = 'fa-solid fa-ellipsis fa-2xl';
  recOptionsBox.appendChild(recOptions);

  var recOptionsPopUp = document.createElement('div');
  recOptionsPopUp.className = 'options-pop-up font-body hidden';

  var editButton = document.createElement('p');
  editButton.className = 'edit';
  editButton.textContent = 'edit';
  editButton.addEventListener('click', handleEdit);

  var deleteButton = document.createElement('p');
  deleteButton.className = 'delete';
  deleteButton.textContent = 'delete';
  deleteButton.addEventListener('click', handleDeleteOption);
  recOptionsPopUp.append(deleteButton, editButton);

  recBoxLeft.append(recImgBox, recOptionsBox, recOptionsPopUp);
  recImgBox.appendChild(recImg);

  ///
  var recBoxRight = document.createElement('div');
  recBoxRight.className = 'rec-info col-three-fifth';

  var recName = document.createElement('h2');
  recName.className = 'font-header';
  recName.textContent = rec.name;

  var recTags = document.createElement('div');
  recTags.className = 'rec-tags-box font-body row flex-wrap';

  for (var i = 0; i < rec.tags.length; i++) {
    var tag = document.createElement('span');
    tag.textContent = rec.tags[i];
    recTags.appendChild(tag);
  }

  var recNotes = document.createElement('p');
  recNotes.className = 'font-body';
  recNotes.textContent = rec.notes;

  var recFriendBar = document.createElement('div');
  recFriendBar.className = 'row col-full justify-align-center';

  var recFriendImgBox = document.createElement('div');
  recFriendImgBox.className = 'rec-friend-img';

  var recFriendImg = document.createElement('img');
  recFriendImg.setAttribute('src', rec.fromFriend.photo);

  var recFriendName = document.createElement('h3');
  recFriendName.className = 'font-body';
  recFriendName.textContent = rec.fromFriend.name[0].toUpperCase() + rec.fromFriend.name.slice(1) + '\'s Rec';

  recBoxRight.append(recName, recTags, recNotes, recFriendBar);
  recFriendBar.append(recFriendImgBox, recFriendName);
  recFriendImgBox.appendChild(recFriendImg);

  ///
  recBox.append(recBoxLeft, recBoxRight);

  return recBox;
}

function handleLoadEntry(event) {
  if (data.entries !== []) {
    for (var i = 0; i < data.entries.length; i++) {
      var currEntry = data.entries[i];
      var entry = makeEntry(currEntry);
      $recEntries.appendChild(entry);
      makeMarker(currEntry.marker.latLng, map, currEntry.fromFriend.photo, currEntry.entryId);
    }
  }

  if (data.friends !== []) {
    for (var j = 0; j < data.friends.length; j++) {
      var currentFriend = data.friends[j];
      addFriendSelectOption(currentFriend);
    }
  }
}

if (data.entries.length !== 0) {
  $noEntries.className = 'no-entries text-align-center hidden';
} else {
  $noEntries.className = 'no-entries text-align-center';
}

function handleEntryActions(event) {

  var dataId = event.target.closest('li').getAttribute('data-entry-id');
  var selector = 'li[data-entry-id="' + dataId + '"]';
  var $optionsList = document.querySelector(selector + ' div.options-pop-up');
  var $optionsButton = document.querySelector(selector + ' div.options-highlight');
  if (event.target.className === 'options-highlight' || event.target.tagName === 'I') {
    $optionsList.className = 'options-pop-up font-body';
    $optionsButton.className = 'options-highlight options-pressed';
  } else {
    $optionsList.className = 'options-pop-up font-body hidden';
    $optionsButton.className = 'options-highlight';

    focusMarker(dataId);
  }

}

function handleEdit(event) {
  $markerButton.className = 'marker-button hidden';
  $entryOverlay.className = 'entry-overlay';
  $selectFriend.className = 'select-friend hidden';
  $addFriend.className = 'add-friend hidden';
  $addEntry.className = 'add-entry';
  $searchInput.className = 'pac-target-input hidden';

  if (mobile === true) {
    $entriesList.style.height = 150 + 'px';
  }

  var dataId = event.target.closest('li').getAttribute('data-entry-id');
  for (var i = 0; i < data.entries.length; i++) {
    var dataEntryId = data.entries[i].entryId;
    if (dataId === dataEntryId.toString()) {
      data.editing = data.entries[i];
      break;
    }
  }

  $addEntrySubmit.elements.recName.value = data.editing.name;
  $addEntrySubmit.elements.entryImage.value = data.editing.image;
  $addEntrySubmit.elements.notes.value = data.editing.notes;
  $addEntryImg.setAttribute('src', data.editing.image);
  $entryFriendImage.setAttribute('src', data.editing.fromFriend.photo);
  $entryFriendName.textContent = data.editing.fromFriend.name[0].toUpperCase() + data.editing.fromFriend.name.slice(1) + '\'s Rec';

  // tags
  for (var j = 0; j < data.editing.tags.length; j++) {
    var tag = document.createElement('span');
    tag.textContent = data.editing.tags[j];
    var deleteTag = document.createElement('i');
    deleteTag.className = 'fa-solid fa-xmark';
    deleteTag.addEventListener('click', handleDeleteTag);
    tag.appendChild(deleteTag);
    $entryTagsList.appendChild(tag);

    tags.push(data.editing.tags[j]);
  }
}

var deleteId;
function handleDeleteOption(event) {
  $deleteOverlay.className = 'delete-overlay row';
  deleteId = event.target.closest('li').getAttribute('data-entry-id');
}

function handleDeleteYesNo(event) {
  if (event.target.tagName !== 'SPAN') {
    return;
  }

  if (event.target.id === 'delete-yes') {
    deleteEntry(deleteId);
  } else if (event.target.id === 'delete-no') {
    $deleteOverlay.className = 'delete-overlay hidden';
  }
}

function deleteEntry(dataId) {

  /// remove from data
  for (var i = 0; i < data.entries.length; i++) {
    if (dataId === data.entries[i].entryId.toString()) {
      deleteMarker(dataId);
      data.entries.splice(i, 1);
      break;
    }
  }

  /// remove from DOM
  var $entriesListArray = document.querySelectorAll('li');
  for (var j = 0; j < $entriesListArray.length; j++) {
    var currentDataEntryId = $entriesListArray[j].getAttribute('data-entry-id');
    if (dataId === currentDataEntryId) {
      $entriesListArray[j].remove();
      break;
    }
  }

  if (data.entries.length === 0) {
    $noEntries.className = 'no-entries text-align-center';
  }

  deleteId = null;
  $deleteOverlay.className = 'delete-overlay hidden';
}

function focusEntry(dataId) {
  if (mobile === true) {
    $entriesList.style.height = 150 + 'px';
  }
  var targetRec = document.querySelector('li[data-entry-id="' + dataId + '"]');
  targetRec.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

$markerButton.addEventListener('click', handleMarkerOverlay);

$selectFriendSubmit.addEventListener('submit', handleSelectFriendSubmit);
$selectFriendAddNew.addEventListener('click', handleSelectAddAFriend);
$selectFriendSelect.addEventListener('change', handleOptionChange);

$fileFriendImg.addEventListener('input', handleFriendImgUpdate);
$addFriendSubmit.addEventListener('submit', handleFriendSubmit);

$fileEntryImg.addEventListener('input', handleEntryImgUpdate);
$addTagButton.addEventListener('click', handleAddTag);
$addEntrySubmit.addEventListener('submit', handleEntrySubmit);

$slideButton.addEventListener('click', handleSlide);
$mql.addEventListener('change', handleScreenChange);

$deleteYesNo.addEventListener('click', handleDeleteYesNo);

window.addEventListener('DOMContentLoaded', handleLoadEntry);

var map;
var autocomplete;
function initMap() {

  var mapOptions = {
    center: { lat: 37.759960311146166, lng: -122.42706470323323 },
    zoom: 18,
    mapId: '2d5a995064aaf095',
    disableDefaultUI: true
  };

  map = new window.google.maps.Map(document.getElementById('map'), mapOptions);

  if (map) {
    setTimeout(function () {
      var loading = document.querySelector('.lds-default');
      loading.className = 'lds-default hidden';
    }, 1000);
  }

  window.google.maps.event.addListener(map, 'click', handleClickMap);

  autocomplete = new window.google.maps.places.Autocomplete(document.getElementById('autocomplete'),
    {
      types: ['establishment'],
      componentRestrictions: { country: ['US'] },
      fields: ['place_id', 'geometry', 'name']
    });

  autocomplete.addListener('place_changed', onPlaceChanged);

}

function onPlaceChanged() {
  var place = autocomplete.getPlace();

  if (!place.geometry) {
    document.getElementById('autocomplete').placeholder = 'Enter a place';
  } else {
    map.setCenter(place.geometry.location);
  }
}

function handleClickMap(event) {
  if (data.marking === false) {
    return;
  }

  openEntry(event, map);
}

var markers = [];
function makeMarker(location, map, iconUrl, entryId) {
  var marker = new window.google.maps.Marker({
    position: location,
    map: map,
    icon: {
      url: iconUrl + '#custom-marker',
      scaledSize: new window.google.maps.Size(60, 60),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(0, 0)
    }
  });
  window.google.maps.event.addListener(marker, 'click', clickMarker);
  marker.setMap(map);

  var markerWithId = {
    marker: marker,
    entryId: entryId
  };
  markers.push(markerWithId);
}

function deleteMarker(dataId) {
  for (var i = 0; i < markers.length; i++) {
    if (dataId === markers[i].entryId.toString()) {
      markers[i].marker.setMap(null);
    }
  }
}

function clickMarker(event) {
  for (var i = 0; i < markers.length; i++) {
    if (event.latLng === markers[i].marker.position) {
      focusEntry(markers[i].entryId);
      map.setCenter(markers[i].marker.position);
    }
  }
}

function focusMarker(dataId) {
  for (var i = 0; i < markers.length; i++) {
    if (dataId === markers[i].entryId.toString()) {
      map.setCenter(markers[i].marker.position);
      map.setZoom(18);
    }
  }
}

window.initMap = initMap;
