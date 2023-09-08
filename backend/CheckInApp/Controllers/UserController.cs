using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CheckInApp.Controllers;

[ApiController]
[Route("[controller]/[action]")]
public class UserController : ControllerBase
{

    public static UserInfo FakeUser { get; set; } = new UserInfo()
    {
        LastCheckIn = null,
        Email = "bob@thebuilder.org"
    };

    
    [HttpPost(Name = "CheckIn")]
    public ActionResult CheckIn()
    {

        lock (User)
        {
            if (FakeUser.LastCheckIn != null && FakeUser.LastCheckIn.TimeOut == null)
            {
                return BadRequest("You are already checked In.");
            }

            FakeUser.LastCheckIn = new CheckInEvent()
            {
                TimeIn = DateTimeOffset.UtcNow
            };
            return Ok(FakeUser.LastCheckIn);

        }
    }
    [HttpPost(Name = "CheckOut")]
    public ActionResult CheckOut()
    {
        lock (User)
        {
            if (FakeUser.LastCheckIn == null || FakeUser.LastCheckIn.TimeOut != null)
            {
                if (FakeUser.LastCheckIn?.IsForcedCheckout == true)
                {
                    return BadRequest("You were forced checkout");    
                }
                return BadRequest("You must be checked in to checkout");
            }

            FakeUser.LastCheckIn.TimeOut = DateTimeOffset.UtcNow;
            return Ok(FakeUser.LastCheckIn);

        }
    }
    [HttpPost(Name = "ForceCheckout")]
    public ActionResult ForceCheckout()
    {
        lock (User)
        {
            if (FakeUser.LastCheckIn == null || FakeUser.LastCheckIn.TimeOut != null)
            {
                return BadRequest("You must be checked in to checkout");
            }

            FakeUser.LastCheckIn.TimeOut = DateTimeOffset.UtcNow;
            FakeUser.LastCheckIn.IsForcedCheckout = true;
            
            return Ok(FakeUser.LastCheckIn);

        }
    }
    [HttpPost(Name = "UserInfo")]
    public UserInfo UserInfo()
    {
        return FakeUser;
    }
}